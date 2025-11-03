import {_MOD, _CONFIG} from "../../diagram/diagram.js"
import {_AXIS} from "../axis.js"
import {_WIN, _CAP} from "../main/main.js"
import {_MAIN as _SQUARE} from "./square.js"
import {_MAIN as _BUTTON} from "./button.js"

export class _MAIN extends _AXIS
{
    constructor()
    {
        super();
        this.type = "group";
        this.checked = false;
        this.isDrag = false;
        this.info = {
            groupping:[]
        };

        // title
        this.title = new _SQUARE();
        this.title.type = "title";
        this.title.Load({backgroundColor: "rgba(54, 54, 54, 0.5)", x: 0, y: 0, width: 100, height: 40});
        this.AppendChild(this.title);

        // border
        // draw 에서 그리기만 하면 될듯

        // move
        // 위치 변경시 this.handdles 에 있는 diagram 이랑 같이 움직이자

    }
    
    Load(info)
    {
        this.key = info.key??this.key;
        for(let name in info)
        {
            if(!info[name]) continue;
            this.info[name] = info[name];
        }

        
        if(info.x || info.y) {
            const gapX = info.x-this.x; 
            const gapY = info.y-this.y;
            for(let i=0; i<this.info.groupping.length; i++) {
                const itemKey = this.info.groupping[i];
                const item = _WIN.FindChild(itemKey);
                if(!item) continue;
                if(info.x) item.x += gapX; 
                if(info.y) item.y += gapY;
                
            }
        }

        // resize
        this.x = info.x??this.x;
        this.y = info.y??this.y;
        this.width = info.width??this.width;
        this.height = info.height??this.height;

        let tText = "";
        let tBackgroundColor = "rgba(54, 54, 54, 0.5)";
        // title resize        
        if(info.title) {
            tText = info.title.text ?? "";
            tBackgroundColor = info.title.backgroundColor ?? "rgba(54, 54, 54, 0.5)";
            
        }
        this.title.Load({x: 40, y: 10, width: this.width-80,
                text: tText, backgroundColor: tBackgroundColor});


        this.Draw();
    }

    Draw()
    {
        // 캡처 사이즈 초기화
        this.cav.width = this.width;
        this.cav.height = this.height;

        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 2;
        const gapTitle = 20;
        
        
        this.ctx.strokeRect(10, 10+gapTitle, this.width-20, this.height-20-gapTitle);
        this.ctx.clearRect(10+gapTitle, 10, this.width-20-gapTitle*2, 10+gapTitle*2);
        
        this.DrawChildren();
    }

    onClick()
    {
        // 클릭이벤트가 필요한가
    }

    AddGroup(diagram)
    {
        console.log("추가1")
        // 이미 있으면 그냥 종료
        for(let i=0; i<this.info.groupping.length; i++) {
            const itemKey = this.info.groupping[i];
            console.log("추가2", itemKey, diagram.key)
            if(itemKey == diagram.key) {
                return;
            }
        }
        console.log("추가3")
        this.info.groupping.push(diagram.key);
        diagram.group = this;
    }
    RemoveGroup(diagram)
    {
        for(let i=0; i<this.info.groupping.length; i++) {
            const itemKey = this.info.groupping[i];
            if(itemKey == diagram.key) {
                this.info.groupping.splice(i, 1);
                diagram.group = null;
                return;
            }
        }
    }
}



