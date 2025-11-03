
import {_MOD, _CONFIG} from "../../diagram/diagram.js"
import {_MAN, _WIN, _GRD, _STO} from "../main/main.js"

export class _MAIN
{
    constructor()
    {
    }

    async Init()
    {
        this.diagram = null;

         // 1. 백그라운드
        this.background = _MOD.element.create("div", this.parentElement);
        this.background.classList.add("background");
        
        // 2. 커버
        this.cover = _MOD.element.create("div", this.background);
        this.cover.classList.add("cover");

        // 3. 폰트
        this.font = await _MOD.panel.create(
            _CONFIG.dir.page + "/palette/fontbox", this.cover);
        this.font.panel.classList.add("font");

        // 4. 이미지
        this.img = new Image();
        this.img.draggable = false;
        this.cover.appendChild(this.img);

        // 그려나 보자
        this.cav = _MOD.element.create("canvas", this.cover);
        this.cav.width = 300;
        this.cav.height = 300;
        this.ctx = this.cav.getContext("2d");
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round'; // 선 끝 둥글게
        this.ctx.lineJoin = 'round'; // 선 연결 둥글게

        this.down = null; // {is:false, offsetX:null, offsetY:null};

        // 5. 이벤트
        this.background.addEventListener("mouseup", async e =>
        {
            if(e.target !== this.background) {
                return;
            }
            this.display = false;
            if(!this.diagram) return;
            
            const imgSave = this.cav.toDataURL("image/png");
            const rootDiagram = this.diagram.GetRoot();
            const info = {
                pen: imgSave
            };
            rootDiagram.Load(info);
            await _STO.SaveDiagram(rootDiagram);
            _WIN.Draw();
            
        });

        // 마우스 누르면 그리기 시작
        this.cav.addEventListener('mousedown', e => {
            this.down = {is:true, offsetX:e.offsetX, offsetY:e.offsetY};
        });

        // 마우스 움직일 때
        this.cav.addEventListener('mousemove', e => {
            if (!this.down) return;

            const x = e.offsetX;
            const y = e.offsetY;

            this.ctx.beginPath();
            this.ctx.moveTo(this.down.offsetX, this.down.offsetY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();

            this.down.offsetX = x;
            this.down.offsetY = y;
        });

        // 마우스 떼면 그리기 끝
        this.cav.addEventListener('mouseup', () => {
            this.down = false;
        });

        // 캔버스를 벗어나도 그리기 종료
        this.cav.addEventListener('mouseleave', () => {
            this.down = false;
        });

    }

    get display()
    {
        return this.background.style.display;
    }
    set display(flag)
    {
        this.background.style.display = (flag == true)? "block":"none";
    }

    get width()
    {
        return this.cav.width;
    }
    set width(size)
    {
        this.cover.style.width = size + "px";
        this.cav.style.width = size + "px"
        this.cav.width = size;
    }

    get height()
    {
        return this.cav.height;
    }
    set height(size)
    {
        this.cover.style.height = size + "px";
        this.cav.style.height = size + "px"
        this.cav.height = size;
    }

    async Load(diagram)
    {
        this.diagram = diagram;
        const ratio = diagram.width/diagram.height;
        const maxWidth = document.body.clientWidth - 100;

        if(maxWidth < diagram.width) {
            this.width = maxWidth;
            this.height = maxWidth/ratio;
        }  
        else {
            this.width = diagram.width;
            this.height = diagram.height;
        }
        
        if(diagram.img) {
            this.img.src = diagram.img.src;
        }
        else {
            this.img.src = "";
        }
        
        // 펜그림 옮기기
        this.ctx.drawImage(diagram.pen, 0, 0);

    }
}