
import {_MOD, _CONFIG} from "../../diagram/diagram.js"
import {_MAN, _MEU, _GRD} from "../main/main.js"
import {_AXIS} from "../axis.js"


export class _MAIN extends _AXIS
{
    constructor()
    {
        super();
        this.type = "window"
        this.scope = { 
            min: 1, max: 6, zoom: 2 // zoom 은 space 값이 브라우저 1픽셀당 얼마나 차지할지 비율
            // zoom 이 1 이상이면 브라우저에 크게보이고, zoom 이 1 이하면 브라우저에 작게보이고
        };
        
        this.background = {
            width: 200, height: 200
        };
        
    }

    async Init()
    {
        // 1. 캔버스 붙이기
        this.parentElement.appendChild(this.cav);

        // 2. 보더용 캔버스 붙이기
        this.cavBorder = document.createElement("canvas");
        this.ctxBorder = this.cavBorder.getContext("2d");
        this.parentElement.appendChild(this.cavBorder);

        window.addEventListener("resize", (e) =>
        {
            this.Resize();
        });
        this.Resize();
    }

    Resize()
    {
        // const dpr = window.devicePixelRatio || 1; // 2일때 고해상도다. 레티나 디스플레이
        const dpr = 1;
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        this.width = this.WindowToSpace(window.innerWidth * dpr);
        this.height = this.WindowToSpace(window.innerHeight * dpr);
        
        this.x = centerX-this.width/2;
        this.y = centerY-this.height/2;
        
        // 메인 cav 사이즈 조정
        this.cav.width = window.innerWidth * dpr;
        this.cav.height = window.innerHeight * dpr;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);

        // 보더 cav 사이즈 조정
        this.cavBorder.width = window.innerWidth * dpr;
        this.cavBorder.height = window.innerHeight * dpr;
        this.ctxBorder.setTransform(1, 0, 0, 1, 0, 0);
        this.ctxBorder.scale(dpr, dpr);
        
        this.Draw();
    }

    get zoom()
    {
        return this.scope.zoom;
    }
    set zoom(zoom)
    {
        if(zoom < this.scope.min || zoom > this.scope.max) {}
        else {this.scope.zoom = zoom;}
    }

    /**
     * 마우스 좌표x 가 상대적으로 space.x 좌표 어느위치인지 반환
     * @param {*} offsetX 
     * @returns 
     */
    SpaceX(offsetX)
    {
        const line = offsetX*this.zoom; // 화면 위치를 zoom 비율로 변환
        return Math.round(this.x + line);
        // return this.x + line;
    }
    /**
     * 마우스 좌표y 가 상대적으로 space.y 좌표 어느위치인지 반환
     * @param {*} offsetY 
     * @returns 
     */
    SpaceY(offsetY)
    {
        const line = offsetY*this.zoom;  // 화면 위치를 zoom 비율로 변환
        return Math.round(this.y + line);
        // return this.y + line;
    }

    WindowX(spaceX)
    {
        return Math.round((spaceX - this.x)/this.zoom); // zoom 비율을 픽셀비율로 전환
        // return (spaceX - this.x)/this.zoom;
    }
    WindowY(spaceY)
    {
        return Math.round((spaceY - this.y)/this.zoom);
        // return (spaceY - this.y)/this.zoom;
    }

    /**
     * space 값을 _WIN pixel 값으로 반환
     * zoom 은 space 값이 브라우저 1픽셀당 얼마나 차지할지 비율
     * zoom 이 1 이상이면 브라우저에 크게보이고, zoom 이 1 이하면 브라우저에 작게보이고
     * @param {*} windowLine 
     * @returns 
     */
    SpaceToWindow(windowLine)
    {
        return Math.round(windowLine/this.zoom);
        // return windowLine*this.zoom;
    }
    /**
     * _WIN pixel 값을 space 값으로 반환
     * zoom 은 space 값이 브라우저 1픽셀당 얼마나 차지할지 비율
     * @param {*} windowLine 
     * @returns 
     */
    WindowToSpace(spaceLine)
    {
        return Math.round(spaceLine*this.zoom);
        // return spaceLine/this.zoom;
    }

    // A 와 B가 서로 겹치는지 체크
    IsCollisionBetween(A, B)
    {
        const rootA = A.GetRoot();
        const rootB = B.GetRoot();

        const xOverlap =
            rootA.x < rootB.x + rootB.width &&
            rootA.x + rootA.width > rootB.x;

        const yOverlap =
            rootA.y < rootB.y + rootB.height &&
            rootA.y + rootA.height > rootB.y;

        return xOverlap && yOverlap;
    }

    GetCollisionGroup(diagram)
    {
        if(!diagram || diagram.type === "group") return null;
        for(let i=this.children.length-1; i>=0; i--)
        {
            const child = this.children[i];
            if(child.type !== "group") continue;

            // 겹치면 true 리턴
            if(this.IsCollisionBetween(diagram, child)) return child;
        }
        return null;
    }


    Draw()
    {
        this.ctx.clearRect(0, 0, this.cav.width, this.cav.height);
        this.DrawBackground();
        
        this.DrawPoint(0, 0, "white") // 0점 표시
        this.DrawChildren();
    }
    // 자식영역 draw
    DrawChildren()
    {
        for(let i=0; i<this.children.length; i++)
        {
            const child = this.children[i];
            switch(child.type)
            {
                case "line":
                    child.Draw();
                    break;
                default:
                    this.ctx.drawImage(
                        child.cav, this.WindowX(child.x), this.WindowY(child.y),
                        this.SpaceToWindow(child.width), this.SpaceToWindow(child.height)
                    );
                    break;    
            }
        }
    }

    DrawPoint(spaceX, spaceY, color)
    {
        const windowX = this.WindowX(spaceX);
        const windowY = this.WindowY(spaceY);
        this.ctx.save();

        this.ctx.font = 18 + "px Arial";
        this.ctx.fillStyle = color;
        this.ctx.textAlign = "center"; // 수평 가운데 정렬
        this.ctx.textBaseline = "middle"; // 수직 가운데 정렬
        this.ctx.fillText(
            "(x:" + spaceX + " y:" + spaceY + ")",
            windowX, windowY + 20);

        this.ctx.beginPath();
        this.ctx.arc(windowX, windowY, 4, Math.PI*2, false);
        this.ctx.fill();

        this.ctx.restore();
        return {x: windowX, y: windowY};
    }

    DrawLine(spaceX1, spaceY1, spaceX2, spaceY2, color)
    {
        const windowX1=this.WindowX(spaceX1), windowY1=this.WindowY(spaceY1),
         windowX2=this.WindowX(spaceX2), windowY2=this.WindowY(spaceY2);

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(windowX1, windowY1);
        this.ctx.lineTo(windowX2, windowY2);
        this.ctx.strokeStyle = color;
        // this.ctx.lineWidth = 4;
        this.ctx.stroke();
        this.ctx.restore();
    }

    DrawBackground()
    {
        const width = this.SpaceToWindow(this.background.width);
        const height = this.SpaceToWindow(this.background.height);
       
        const sx = this.WindowX(0)%width - width; // 그리드 시작x
        const sy = this.WindowY(0)%height - height; // 그리드 시작y
        const cols = Math.ceil(this.cav.width/width) + 2;
        const rows = Math.ceil(this.cav.height/height) + 2;

        this.ctx.save();

        // 배경색 그리기
        this.ctx.fillStyle = "rgb(30, 30, 40)";
        this.ctx.fillRect(0,0,this.cav.width,this.cav.height);

        this.ctx.strokeStyle = "rgb(90, 90, 110)";
        this.ctx.lineWidth = (this.scope.min/this.zoom);
        this.ctx.beginPath();
        for(let col=0; col<cols; col++)
        {
            for(let row=0; row<rows; row++)
            {
                this.ctx.moveTo(sx+col*width, sy+row*height);
                this.ctx.lineTo(sx+(col+1)*width, sy+(row+1)*height);

                this.ctx.moveTo(sx+(col+1)*width, sy+row*height);
                this.ctx.lineTo(sx+col*width, sy+(row+1)*height);
            }
        }
        this.ctx.stroke();
        this.ctx.restore();
    }

    // space 기준
    DrawBorder(x, y, width, height, color="white")
    {

        this.ctxBorder.clearRect(0, 0, this.cavBorder.width, this.cavBorder.height);
        // this.ctx.save();
        this.ctxBorder.strokeStyle = color;
        this.ctxBorder.strokeRect(
            this.WindowX(x), this.WindowY(y),
            this.SpaceToWindow(width), this.SpaceToWindow(height));
        // this.ctx.restore();
    }

    ClearBorder()
    {
        this.ctxBorder.clearRect(0, 0, this.cavBorder.width, this.cavBorder.height);
    }
}
