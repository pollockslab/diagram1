import {_AXIS} from "../axis.js"
import {_GIM} from "../main/main.js"

export class _MAIN extends _AXIS
{
    constructor()
    {
        super("button");
        this.info = {};
        const gim = _GIM.Find("favorite");
        this.img = gim.img;
    }
    
    Load(info)
    {
        // info에 float:right 있으면 우측 기준으로, left면 좌측으로
        // 기본 우측으로 해보자
        // 이미지도
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

        this.Draw();
    }

    Draw()
    {
        // 캡처 사이즈 초기화
        this.cav.width = this.width;
        this.cav.height = this.height;

        // this.ctx.fillStyle = this.info.backgroundColor ?? "black";
        // this.ctx.fillRect(0, 0, this.width, this.height);
        // this.ctx.fillStyle = "white";
        // this.ctx.fillText(this.info.text, 0, 10);
        this.ctx.drawImage(this.img, 0, 0, this.width, this.height);

        this.DrawChildren();
    }

    onClick()
    {
        console.log("즐찾누름")
    }

}



