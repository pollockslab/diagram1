
import {_MOD, _CONFIG} from "../diagram/diagram.js"
import {_STO, _SETTING, _WIN} from "./main/main.js"
import {_MAIN as _MEMO} from "./diagram/memo.js"
import {_MAIN as _SQUARE} from "./diagram/square.js"
import {_MAIN as _LINE} from "./diagram/line.js"
import {_MAIN as _PICTURE} from "./diagram/picture.js"
import {_MAIN as _GROUP} from "./diagram/group.js"

export class _MAIN
{
    constructor()
    {
        this.spaceKey = null;
        this.square = [];
        this.line = [];
    }
    async Init(){}

    async Load(key)
    {
        // 맵정보 가져오기
        const selectSetting = await _STO.SelectSetting();
        const select = await _STO.LoadSpace(key, selectSetting.space);

        // 맵 초기화
        this.spaceKey = select.key;
        this.square = [];
        this.line = [];   
        
        // 상자정보 저장
        const list = select?.list;
        
        if(Array.isArray(list))
        {
            for(const diagramKey of list)
            {
                const select = await _STO.SelectDiagram(diagramKey);
                if(!select) {continue;}
                await this.Add(select.key, select.type, select.info);
            };
        }
        
    }

    // 객체 찾기
    FindToKey(key)
    {
        for(const square of this.square)
        {
            if(square.key == key) return square;
        }
        return null;
    }
    FindToPos(spaceX, spaceY)
    {
        // 상자 겹치면 z-index 높은걸로 반환
        const square = this.square.reduceRight((topMost, obj) =>
        {
            const contains = (
                obj.x <= spaceX &&
                obj.x + obj.width >= spaceX &&
                obj.y <= spaceY &&
                obj.y + obj.height >= spaceY
            );
            if(!contains) return topMost;
            if(!topMost || obj.z > topMost.z) return obj;
            return topMost;
        }, null);
        return square;
    }
      
    /**
     * 상자에 연결된 라인찾기
     * @param {diagram.key} squareKey 상자 key
     */
    GetLinkedLine(diagram)
    {
        const lines = [];
        for(let i=0; i<_WIN.children.length; i++)
        {
            const child = _WIN.children[i];
            if(child.type !== "line") continue;
            if(child.info.squareKey1 === diagram.key ||
                child.info.squareKey2 === diagram.key)
            {
                lines.push(child);
            }
        }
        return lines;
    }
    
    async Add(key, type, info, addr)
    {
        let diagram = null;
        switch(type)
        {
            case "memo":    diagram = new _MEMO();      break;
            case "square":  diagram = new _SQUARE();    break;
            case "line":    diagram = new _LINE();      break;
            case "picture": diagram = new _PICTURE();   break;
            case "group":   diagram = new _GROUP();     break;
            default: return;
        }
        info.key = key;
        await diagram.Load(info, addr);
        _WIN.AppendChild(diagram);
        // key 없으면 생성
        if(!key)
        {
            await _STO.SaveDiagram(diagram);
        }

        return diagram;
    }
    
    /**
     * 상자삭제
     * @param {diagram} key 상자 key
     */
    async DeleteSquare(diagram)
    {   
        let number = _WIN.children.indexOf(diagram);
        if(number < 0) return false;

        // 1. 라인들 조회
        const lines = this.GetLinkedLine(diagram);
       
        // 2. 라인삭제
        for(let i=0; i<lines.length; i++) 
        {
            await this.DeleteLine(lines[i]);
        };
        
        // 3. db-> diagram, space 에서 상자 삭제
        await _STO.DeleteDiagram(diagram.key);

        // 4. 배열에서 제거
        number = _WIN.children.indexOf(diagram);
        _WIN.children.splice(number, 1);
        return true;
    }

    /**
     * 라인삭제
     * @param {diagram} key 상자 key
     */
    async DeleteLine(diagram)
    {   
        const number = _WIN.children.indexOf(diagram);
        if(number < 0) return false;
        
        // 1. DB에서 제거
        await _STO.DeleteDiagram(diagram.key);

        // 2. 배열에서 제거
        _WIN.children.splice(number, 1);
        
        return true;
    }

    async SpaceOut()
    {
        if(this.spaceKey == "super") {
            return;
        }

        // 부모 space 못찾을시 => 'super' 로 접속하기
        const select = await _STO.LoadParentSpace(this.spaceKey);

        // 맵 초기화
        await this.Load(select.key);
    }

    async UpdateSpace()
    {
        // _WIN 에서 child 목록 가져와서 업데이트
        const list = [];
        for(let i=0; i<_WIN.children.length; i++)
        {
            const child = _WIN.children[i];
            list.push(child.key);
        }
        
        const select = await _STO.SelectSpace(this.spaceKey);
        select.list = list;
        // 업데이트
        await _STO.UpdateSpace(select);
    }
}