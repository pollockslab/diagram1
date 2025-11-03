import {_AXIS} from "../axis.js"
import {_CAP, _PTT} from "../main/main.js"

export class _MAIN extends _AXIS
{
    constructor()
    {
        super();
        this.type = "picture";
        this.checked = false;
        this.isDrag = true;
        this.info = {
            text: "", backgroundColor: null
        };
        this.textHeight = 0;

        this.img = new Image();
        this.pen = new Image();
    }
    
    async Load(info, isPictureSize)
    {
        this.key = info.key??this.key;
        for(let name in info)
        {
            if(!info[name]) continue;
            this.info[name] = info[name];
        }
        
        // resize
        this.x = info.x??this.x;
        this.y = info.y??this.y;
        this.width = info.width??this.width;
        this.height = info.height??this.height;
        
        if(info.file) {
            this.img = await this.FileLoad(info.file);
            if(isPictureSize) {
                this.width = this.img.width;
                this.height = this.img.height;
                this.info.width = this.width;
                this.info.height = this.height;
            }
        }
       
        if(info.pen) {
            this.pen = await this.ImgLoad(info.pen);
            
        }
        this.Draw();
    }

    async FileLoad(file)
    {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = (e) =>
            {
                resolve(img);
            };
        })
    }
    async ImgLoad(data)
    {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = data;
            img.onload = (e) =>
            {
                resolve(img);
            };
        })
    }

    Draw(gapX=0, gapY=0, gapWidth=0, gapHeight=0)
    {
        // 캡처 사이즈 초기화
        this.cav.width = this.width;
        this.cav.height = this.height;
        this.ctx.strokeStyle = "white";
        this.ctx.strokeRect(0,0, this.width, this.height);
        this.ctx.drawImage(this.img, 0,0, this.width, this.height);
        this.ctx.drawImage(this.pen, 0,0, this.width, this.height);

        this.DrawChildren();
    }

    onClick()
    {
        _PTT.Load(this);
        _PTT.display = true;
    }
    
}



