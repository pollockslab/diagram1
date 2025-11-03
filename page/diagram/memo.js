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
        
        this.checked = false;
        this.key = null;
        this.type = "memo";
        this.info = {
            x:0, y:0, width: 100, height: 100,
            title: "", content: ""
        };

        // title
        this.title = new _SQUARE();
        this.title.type = "title";
        this.title.Load({backgroundColor: "rgb(54, 54, 54)", x: 0, y: 0, width: 10, height: 40});
        this.AppendChild(this.title);

        // content
        this.content = new _SQUARE();
        this.content.isDrag = false; // 컨트롤에서 드래그true 면 상자 드래그 가능
        this.content.type = "content";
        this.content.Load({backgroundColor: "orange", x: 0, y: 40, width: 10, height: 10});
        this.AppendChild(this.content);

        // 즐겨찾기 버튼모양
        this.favorite = new _BUTTON();
        this.favorite.isDrag = false;
        this.favorite.type = "button";
        this.favorite.Load({backgroundColor: "red", float:"right", x: 200, y: 40, width: 50, height: 50, text:"버튼"});
        this.AppendChild(this.favorite);
    }
    
    Load(info)
    {
        this.key = info.key??this.key;
        for(let name in info)
        {
            this.info[name] = info[name];
        }
        
        // resize
        this.x = info.x??this.x;
        this.y = info.y??this.y;
        this.width = info.width??this.width;
        this.height = info.height??this.height;
        
        if(info.title) {
            this.title.Load(info.title);
        }
        if(info.content) {
            this.content.Load(info.content);
        }
        
        this.Draw();

        if(info.title) {
            const textHeight = (this.title.textHeight != 0)? this.title.textHeight:this.title.height;
            this.title.Load({height: textHeight});
            this.content.Load({y: textHeight});
            this.height = this.height;
            this.Draw();
        }
    }
    get width()
    {
        return this._axis.width;
    }
    set width(width)
    {
        width = (width < 100)? 100:width;
        this._axis.width = Math.round(width);
        this.title.width = this._axis.width;
        this.content.width = this._axis.width;
    }

    get height()
    {
        return this._axis.height;
    }
    set height(height)
    {
        height = (height < 100)? 100:height;
        this._axis.height = Math.round(height);
        this.content.height = this._axis.height - this.title.height;
    }

    Draw()
    {
        this.cav.width = this.width;
        this.cav.height = this.height;

        this.ctx.save();
        
        this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)"; // 그림자 색상
        this.ctx.shadowBlur = 10;                    // 퍼짐 정도
        this.ctx.shadowOffsetX = 0;                  // x축 이동
        this.ctx.shadowOffsetY = 0;                  // y축 이동

        this.ctx.fillStyle = "rgba(0,0,0,1)";
        this.ctx.fillRect(10, 10, this.width-20, this.height-20);
        this.ctx.clearRect(10, 10, this.width-20, this.height-20);
        
        this.ctx.restore();

        this.DrawChildren();
    }
    // 자식영역 draw
    DrawChildren()
    {
        for(let i=0; i<this.children.length; i++)
        {
            const child = this.children[i];
            if(child.type === "title") {child.Draw(10, 10, 20, 0);}
            else if(child.type === "content") {child.Draw(10, 0, 20, 10);}
            else {child.Draw();}
            this.ctx.drawImage(child.cav, child.x, child.y);
        }
    }
}



