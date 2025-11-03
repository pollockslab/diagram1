import {_MOD, _CONFIG} from "../../diagram/diagram.js"
import {_PTT} from "../main/main.js"

export class _MAIN
{
    constructor()
    {
    }

    async Init()
    {
        // 배경색상
        // this.backColorPicker = new _COLOR_PICKER(this.parentElement);
        // this.backColorPicker.select.style.borderRadius = "4px";

        // 글자크기
        this.fontSize = await _MOD.combobox.create("none", "font-size", 
            [
                {value: 1, title: "1px", selected: true},
                {value: 2, title: "2px"},
                {value: 3, title: "3px"},
                {value: 5, title: "5px"},
                {value: 10, title: "10px"},
                {value: 100, title: "100px"},
            ], this.parentElement);
        this.fontSize.input.placeholder = "size";

        // 글자색상
        this.colorPicker = new _COLOR_PICKER(this.parentElement);
        
        // 글자굵기
        this.erazer = _MOD.element.create("div", this.parentElement);
        this.erazer.textContent = "E";
        this.erazer.classList.add("font-style");
        this.erazer.setAttribute("tabindex", "-1");
        this.erazer.style.fontWeight = "bold";

        

        // 이벤트
        // this.backColorPicker.SetEvent((color) =>
        // {
        //     _PTT.cover.style.backgroundColor = color;
        // });
        this.fontSize.OnTextChanged(size =>
        {
            _PTT.ctx.lineWidth = size;
        });

        this.colorPicker.SetEvent((color) =>
        {
            _PTT.ctx.strokeStyle = color;
        });

        this.erazer.addEventListener("click", e =>
        {
            this.erazer.classList.toggle("font-style-click");
            const isContain = this.erazer.classList.contains("font-style-click");

            if(isContain) {
                _PTT.ctx.globalCompositeOperation = "destination-out";
            }
            else {
                _PTT.ctx.globalCompositeOperation = "source-over";
            }
        });
    }

    Set(style)
    {
        this.colorPicker.value = style.color ?? "black";
        if(style.fontSize){
            this.fontSize.input.textContent = style.fontSize.replace("px", "");
        }
        else{
            this.fontSize.input.textContent = 2;
        }
    }
    // SetBackgroundColor(color)
    // {
    //     this.backColorPicker.select.style.backgroundColor = color;
    // }

    Load(style)
    {
        this.backColorPicker.select.style.backgroundColor = style.backgroundColor;
        this.colorPicker.value = style.color ?? "black";
        if(style.fontSize){
            this.fontSize.input.textContent = style.fontSize.replace("px", "");
        }
        else{
            this.fontSize.input.textContent = 2;
        }

        if(style.fontWeight == "bold") this.bold.classList.add("font-style-click");
        else this.bold.classList.remove("font-style-click");
    }
}

class _COLOR_PICKER 
{
    constructor(parentElement)
    {
        this.parentElement = parentElement;
        this.palette = {
            default: ["black", "white", "red", "orange", "yellow",
                "green", "blue", "navy", "purple"]
        };
        
        // 컬러선택
        this.select = _MOD.element.create("div", this.parentElement);
        this.select.classList.add("picker-color");
        this.select.classList.add("picker-select");
        // this.select.setAttribute("tabindex", "-1"); // 포커스 가능하게 변경

        // 팝업
        this.popup = _MOD.element.create("div", this.parentElement);
        this.popup.classList.add("picker-popup");
        this.popup.setAttribute("tabindex", "-1"); // 포커스 가능하게 변경
        this.popup.style.display = "none";

        // 팔레트에 색정보 등록
        for(let item of this.palette.default)
        {
            const color = _MOD.element.create("div", this.popup);
            color.classList.add("picker-color");
            color.style.backgroundColor = item;
        }
        
        // 이벤트
        this.select.addEventListener("mousedown", e =>
        {
            e.preventDefault(); // 에디터 캐럿해제 막기위해 선언
        });
        this.select.addEventListener("mousedown", e =>
        {
            // e.preventDefault();
          
            this.popup.style.display = "block";
            this.popup.focus();
        });

        this.popup.addEventListener("mousedown", e =>
        {
            e.preventDefault(); // 에디터 캐럿해제 막기위해 선언
        });
        this.popup.addEventListener("click", e =>
        {
            if(e.target.style.backgroundColor)
            {
                this.select.style.backgroundColor = 
                    e.target.style.backgroundColor;
                this.popup.style.display = "none";
                if(this.eventCall) {
                    this.eventCall(e.target.style.backgroundColor);
                }
            }
        });
        this.popup.addEventListener("focusout", (e) => 
        {
            if(e.relatedTarget == this.select) return;
            this.popup.style.display = "none";
        });
    }
    get value()
    {
        return this.select.style.backgroundColor;
    }
    set value(color)
    {
        this.select.style.backgroundColor = color;
    }
    SetEvent(call)
    {
        this.eventCall = call;
    }
}