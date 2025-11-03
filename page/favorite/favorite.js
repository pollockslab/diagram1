import {_MOD, _CONFIG} from "../../diagram/diagram.js"
import {_WIN, _GRD} from "../main/main.js"

export class _MAIN
{
    constructor()
    {
        this.list = [];
    }

    async Init()
    {
        const src = _CONFIG.dir.resource + "/menu/favorite.png";
        this.star = await _MOD.button.create(src, ["star"], this.parentElement);
        this.star.title = "즐겨찾기 숨기기";

      
    }

    Load(key)
    {
        // 여기서 가져오면 분리되어서 grid에서 로딩할때 여기도 로딩해야되는 불편함
        // 이 있지. 여기 로딩 안해주면. 음
        
        for(let i=0; i<_WIN.children.length; i++)
        {
            const item = _WIN.children[i];
            if(item.type != "memo") continue;
            this.Add(item);
        }
    }

    Add(diagram)
    {
        const icon = _MOD.element.create("div", this.parentElement);
        icon.classList.add("icon");

        const title = _MOD.element.create("div", icon);
        title.classList.add("title");
        title.innerHTML = diagram.info.title.text ?? "Untitled";
        // title.title = diagram.info.title.text;

        const close = _MOD.element.create("div", icon);
        close.classList.add("close");
        close.textContent = "x";

        this.list.push({
            diagram: diagram,
            icon: icon,
        });

        // 이벤트(이렇게 하면 디비를 새로 파야돼. space 넘나들려면)
        // 전체스페이스를 한곳에서 볼 수 있으니까
        title.addEventListener("click", async (e) =>
        {
            const x = diagram.x + diagram.width/2 - _WIN.width/2;
            const y = diagram.y + diagram.height/2 - _WIN.height/2;
            _WIN.x = x;
            _WIN.y = y;
            _WIN.Draw();
        });

        close.addEventListener("click", (e) =>
        {
            console.log("클릭");
            this.Remove(diagram);
        });
    }

    Remove(diagram)
    {
        
    }
}