
class _DIAGRAM
{
    constructor()
    {
        this._key_count = 0;
        this._list = [
            {script:"element"},
            {script:"panel"},
            {script:"page"},
            {script:"script"},
            {script:"button"},
            {script:"combobox", css:true},
            {script:"indexeddb"}
        ];
        this._clone = {}; // key 로 복사
    }

    async Init()
    {
        // 클래스 로드
        for(let item of this._list)
        {
            const script = await import(_CONFIG.dir.diagram + item.script + ".js");
            this[item.script] = script.default;
            if(item.css)
            {   
                const response = await fetch(_CONFIG.dir.diagram + item.script + ".css");
                const cssText = await response.text();
                this._clone[item.script] = cssText;
            }
        }
        const panel = await this.panel.create(_CONFIG.dir.main);
        panel.panel.id = "div_main";
    }

    CloneCSS(key)
    {
        const style = document.createElement("style");
        style.textContent = this._clone[key];
        return style;
    }

    // CSS 파일 지역화 하기(캡슐화)
    // (전통적으로 .div1 .button { color: red; } 과 같이 prefix를 붙였으나)
    // (지저분해서 해결책으로 Shadow DOM 사용.)
    // {shadow에서 :root 의 대용은 :host}
    // 전역 css 파일에서 선언한 :root {--루트변수} 값은 var(--루트변수) 로 읽어올 수 있다
    // 그 외에 외부값을 가져올 방법은 없다
    Shadow(div, src)
    {
        const shadow = div.attachShadow({mode: "open"});

        // css 파일
        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.type = "text/css";
        // style.href = "./style.css";
        style.href = src;
        shadow.appendChild(style);

        return shadow;
    }

    GetCurrentDateTime() 
    {
        const now = new Date();
    
        const year   = now.getFullYear();
        const month  = String(now.getMonth() + 1).padStart(2, '0');  // 0~11 이라 +1
        const day    = String(now.getDate()).padStart(2, '0');
        const hour   = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');
    
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }

    MakeKey()
    {
        return `${Date.now()}_${this._key_count++}`;
    }
}

export const _CONFIG = {};
export const _MOD = new _DIAGRAM();

new Promise((response) => {response();})
.then(async () =>
{
    let pathname = "";
    // 깃허브용 절대경로 추가
    if(window.location.pathname.indexOf("/diagram1") >= 0) {
        pathname = "/diagram1/";
    }

    // 1. 환경설정 로드
    const response = await fetch(pathname + "diagram/config.json");
    const json = await response.json();
    Object.assign(_CONFIG, structuredClone(json));

    for(const key in _CONFIG.dir)
    {
        _CONFIG.dir[key] = pathname + _CONFIG.dir[key];
    }

    // 2. 모듈 실행
    await _MOD.Init();
});