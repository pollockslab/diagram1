
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
            _CONFIG.dir.page + "/editor/fontbox", this.cover);
        this.font.panel.classList.add("font");

        // 4. 내용
        this.textarea = await _MOD.panel.create(
            _CONFIG.dir.page + "/editor/textarea", this.cover);
        this.textarea.panel.classList.add("content");
        
       
        // 5. 이벤트
        this.background.addEventListener("mouseup", async e =>
        {
            
            if(e.target === this.background) {
                this.display = false;
                if(!this.diagram) return;
                
                const rootDiagram = this.diagram.GetRoot();
                const textarea = this.textarea.page.text;
                
                let info = {};
                if(this.diagram.type === "square") {
                    info = {
                        text: textarea.innerHTML?? "",
                        backgroundColor: textarea.style.backgroundColor
                    };    
                }
                else {
                    info[this.diagram.type] = {
                        text: textarea.innerHTML?? "",
                        backgroundColor: textarea.style.backgroundColor
                    };
                }
                
                rootDiagram.Load(info);
                await _STO.SaveDiagram(rootDiagram);
                _WIN.Draw();
            }
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

    Load(diagram)
    {
        this.diagram = diagram;
        const info = this.diagram.info;
        
        this.textarea.page.Load({
            text: info.text,
            backgroundColor: info.backgroundColor
        });

        this.cover.style.width = this.diagram.width + "px";

        // fontbox 초기화
        this.font.page.Load({
            backgroundColor: info.backgroundColor
        });
    }

    Open()
    {

    }
    Close()
    {

    }
    
}