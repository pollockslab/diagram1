import {_MOD} from "./diagram.js"

export default class _DIAGRAM_INDEXEDDB
{
    constructor()
    {
    }

    async Init(json)
    {
        this.json = json;
        // console.log("json", this.json)
        return new Promise((resolve, reject) =>
        {
            // db 오픈
            const req = window.indexedDB.open("diagram", this.json.version);
            req.onerror = (e) => {
                // console.log("indexedDB error", e);
                reject(new Error("open failed"));
            };
            req.onsuccess = (e) => {
                this.db = e.target.result;
                console.log("indexedDB success", req.result);
                resolve();
            };
            req.onupgradeneeded = (e) => {
                try {
                    this.db = e.target.result;
                    console.log("upgrade", this.db);
                    
                    for(let name in this.json.table)
                    {
                        this.#Create(e,
                                name, 
                                this.json.table[name].key,
                                this.json.table[name].index);
                    }

                    // 버전정보 등록
                    const ts = e.target.transaction;
                    const store = ts.objectStore("version_history");
                    store.add({
                        version: this.json.version,
                        timestamp: _MOD.GetCurrentDateTime()}
                    );
                }
                catch(e) {
                    reject(e);
                }
                
            };
        })
        .catch((error) =>
        {
            console.log(error);
        });
    }

    #Create(e, name, key, index)
    {
        if (!this.db.objectStoreNames.contains(name)) {
            this.db.createObjectStore(name, key);
        }
        const ts = e.target.transaction;
        const store = ts.objectStore(name);

        if(index) {
            // Index 생성 
            for(let idx of index)
            {
                if (!store.indexNames.contains(idx.key)) {
                    store.createIndex(idx.key, idx.key, {unique: idx.uniqe});
                }
            }
        }
    }

    /**
     * 데이터키가 테이블키에 존재하는지
     * @param {string} table 테이블 이름
     * @param {object} data 확인할 키:값 객체 
     * @returns {boolean} 존재유무
     */
    #KeyExist(table, data)
    {
        const info = this.json.table[table];
        if(info == null) return false;
        const columns = info["column"];
        return Object.keys(data).every(key => columns.includes(key));
    }
    
    /**
     * 테이블키, 데이터키의 명칭과 수가 일치하는지
     * @param {string} table 테이블 이름
     * @param {object} data 확인할 키:값 객체 
     * @returns {boolean} 존재유무
     */
    #AllKeyExist(table, data)
    {
        const info = this.json.table[table];
        if(info == null) return false;
        return info["column"].every(key => key in data);
    }

    async Select(table, key)
    {
        return new Promise((resolve, reject) =>
        {
            try
            {
                const ts = this.db.transaction(table, "readonly");
                const store = ts.objectStore(table);
                const request = store.get(key);

                request.onsuccess = (e) => {
                    resolve(e.target.result || null);
                };
                request.onerror = (e) => {
                    // 오류로그 남기자. 안내창 띄우자(게임종료)
                    reject(e.target.error.message);
                };
            }
            catch(error)
            {
                // 오류로그 남기자
                reject(error);
            }
        })
        .catch(async (error) =>
        {
            // throw error;
            console.log(error);
            // alert(error)
        });
    }

    async Insert(table, data)
    {
        return new Promise((resolve, reject) =>
        {
            try 
            {
                if(this.#AllKeyExist(table, data) == false) {
                    reject("Column is not compare");
                    return;
                }
                const ts = this.db.transaction(table, "readwrite");
                const store = ts.objectStore(table);
                const request = store.add(data);

                request.onsuccess = (e) => {
                    resolve(e.target.result || null);
                };
                request.onerror = (e) => {
                    reject(e.target.error.message);
                };
            } 
            catch(error)
            {
                reject(error);
            }
        })
        .catch((error) =>
        {
            // throw error;
            console.log(error)
            // alert(error)
        });
    }

    async Update(table, data)
    {
        return new Promise((resolve, reject) => {
            try {
                if(this.#KeyExist(table, data) == false) {
                    reject("Column is not compare");
                    return;
                }
                const ts = this.db.transaction(table, "readwrite");
                const store = ts.objectStore(table);
                const get = store.get(data[store.keyPath]);
                get.onerror = (e) => {
                    reject(e.target.error.message);
                }
                get.onsuccess = (e) => {
                if(e.target.result)
                {
                    const request = store.put(
                        // 기존값 유지 + 새로운값 덮어쓰기
                        { ...e.target.result, ...data}
                    );  // add 대신 put 사용

                    request.onsuccess = (e) => {
                        resolve(e.target.result || null);
                    };
                    request.onerror = (e) => {
                        reject(e.target.error.message);
                    };
                }
                else
                {
                    reject("not exist keyPath");
                }};
            } catch (error) {
                reject(error);
            }
        })
        .catch((error) =>
        {
            // throw error;
            console.log(error)
            // alert(error)
        });
    }

    async Delete(table, key)
    {
        return new Promise((resolve, reject) => {
            try {
                const ts = this.db.transaction(table, "readwrite");
                const store = ts.objectStore(table);
                const request = store.delete(key);

                request.onsuccess = (e) => {
                    resolve(e.target.result || null);
                };
                request.onerror = (e) => {
                    reject(e.target.error.message);
                };
            } catch (error) {
                reject(error);
            }
        })
        .catch((error) =>
        {
            // throw error;
            console.log(error);
            // alert(error)
        });
    }

    static async create(json_src)
    {
        if (!window.indexedDB) return null;

        const instance = new _DIAGRAM_INDEXEDDB();
     
        // json 파일 읽어서 db오픈
        const json_fetch = await fetch(json_src);
        const json = await json_fetch.json();
        await instance.Init(json);

        return instance;
    }
}