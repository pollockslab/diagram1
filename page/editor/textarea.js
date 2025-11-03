import {_MOD, _CONFIG} from "../../diagram/diagram.js"
import {_MAN, _WIN, _EDT} from "../main/main.js"

export class _MAIN
{
    constructor()
    {
        this._style_default = {
            color: "black", 
            fontSize: "22px", 
            // textDecoration: "underline", // none
            fontStyle: "normal", // italic
            fontWeight: "normal" // bold
        };
    }

    async Init()
    {

        // 글자를 각각 따로주기 위해서 div 로 변경하자
        this.text = document.createElement("div");
        this.text.classList.add("text");
        this.text.setAttribute("contenteditable", "true");
        this.parentElement.appendChild(this.text);
        const editable = this.text;
        editable.innerHTML = "감<span style='color:red;'>사</span><span>합</span>니다 abcd<br><span style='color:white;font-size:48px;'>안녕12</span>3<br>반갑습니다.";

       
        editable.addEventListener("keydown", (e) => 
        {
            // 엔터로 줄바꿈 할경우 <div><br></div> 가 생겨서 
            // 쉬프트+엔터 눌렀을때 효과처럼 <br> 만 생기는 효과처럼 만들기    
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                
                const br = document.createElement("br");
                const fragment = document.createDocumentFragment();
                fragment.appendChild(br);

                const sel = this.parentElement.getSelection();
                const range = sel.getRangeAt(0);

                range.deleteContents();
                range.insertNode(fragment);

                range.setStart(br, 0);
                range.collapse(false);

                sel.removeAllRanges();
                sel.addRange(range);
            }
        });

        editable.addEventListener("mouseup", (e) => 
        {
            // 커서위치의(범위캐럿 제외) 스타일 fontbox 에 적용까지 개발함.

            const sel = this.parentElement.getSelection();
            if (!sel.rangeCount) return;

            const range = sel.getRangeAt(0);
            if (range.collapsed) { // 캐럿만 있음 (글자 사이, 파란색 선택 영역 없음)
                const parentNode = range.startContainer.parentNode;

                if (parentNode.nodeType === Node.ELEMENT_NODE &&
                    parentNode.tagName === "SPAN" &&
                    parentNode.getAttribute("style")) 
                {
                    const postStyle = {};
                    for (let styleName in this._style_default) {
                        const value = parentNode.style[styleName];
                        if (value) {
                            postStyle[styleName] = value;
                        }
                    }
                    _EDT.font.page.Set(postStyle);
                }
                else {
                    _EDT.font.page.Set({});
                }
            } 
            
        });
    }

    Load(info)
    {
        this.text.innerHTML = info.text.replace(/\n/g, "<br>");
        this.text.style.backgroundColor = info.backgroundColor ?? "black";
    }

    StyleUpCaret(style) 
    {
        // 1. 캐럿 정보 가져오기
        const sel = this.parentElement.getSelection();
        if (!sel.rangeCount) return;
        const range = sel.getRangeAt(0);

        // 2. 선택 영역 추출
        const fragment = document.createDocumentFragment();
        const content = range.extractContents();

        // 3. 선택 영역 child 돌면서 스타일 적용
        for (let child of content.childNodes) {
            const clone = child.cloneNode(true);
           
            if (child.tagName === "SPAN") {
                // 기존 span이면 style 덮어쓰기
                for (let textStyle in style) {
                    clone.style[textStyle] = style[textStyle];
                }
                fragment.appendChild(clone);
            } else if (child.tagName === undefined) {
                // 텍스트 노드는 span으로 감싸기
                const coverSpan = document.createElement("span");
                for (let textStyle in style) {
                    coverSpan.style[textStyle] = style[textStyle];
                }
                coverSpan.appendChild(clone);
                fragment.appendChild(coverSpan);
            } else {
                // br 등 다른 요소
                fragment.appendChild(clone);
            }
        }

        // 4. fragment DOM에 삽입
        range.insertNode(fragment);

        // 5. span 분리결합
        this.FullSplitSpan();
        this.RemoveEmptySpans();
        this.MergeAdjacentSpans();
        this.TextFromDefaultStyleSpans();
        

        // 6. 캐럿 위치 지정
        const lastNode = fragment.lastChild;
        if (!lastNode) return; // fragment가 비어있으면 종료

        const newRange = document.createRange();
        if (lastNode.nodeType === Node.TEXT_NODE) {
            newRange.setStart(lastNode, lastNode.textContent.length);
        } else if (lastNode.nodeType === Node.ELEMENT_NODE) {
            newRange.setStart(lastNode, lastNode.childNodes.length);
        } else {
            // 그 외 노드 타입이면 range collapse
            newRange.setStart(range.startContainer, range.startOffset);
        }
        newRange.collapse(true);

        sel.removeAllRanges();
        sel.addRange(newRange);

    }

    // [전체] span내에 자식span 분리해서 형제node로 옮김
    FullSplitSpan() 
    {
        for (let child of Array.from(this.text.childNodes)) {   
            if (child.tagName === "SPAN") {
                this.SplitSpan(child);
            }
        }
    }
    // [개별] span내에 자식span 분리해서 형제node로 옮김
    // SplitSpan(span) 
    // {
    //     const parent = span.parentNode;
    //     const fragment = document.createDocumentFragment();

    //     for (let child of Array.from(span.childNodes)) {
    //         if (child.nodeType === Node.TEXT_NODE) {
    //             const newSpan = document.createElement("span");
    //             newSpan.style.cssText = span.style.cssText; // 부모 스타일 유지
    //             newSpan.textContent = child.textContent;
    //             fragment.appendChild(newSpan);
    //         } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName === "SPAN") {
    //             fragment.appendChild(child); // 자식 span 그대로
    //         } else {
    //             fragment.appendChild(child.cloneNode(true)); // br 등
    //         }
    //     }

    //     parent.insertBefore(fragment, span);
    //     parent.removeChild(span);
    // }

    // [개별] span 내의 자식 span들을 분리해서 형제로 올리기 (스타일 계승 포함)
    SplitSpan(span) 
    {
        const parent = span.parentNode;
        const fragment = document.createDocumentFragment();

        // 부모 스타일을 객체 형태로 파싱
        const parentStyle = span.style;

        for (let child of Array.from(span.childNodes)) {
            if (child.nodeType === Node.TEXT_NODE) {
                // 텍스트 노드 → 부모 스타일 그대로 적용
                const newSpan = document.createElement("span");
                newSpan.style.cssText = parentStyle.cssText;
                newSpan.textContent = child.textContent;
                fragment.appendChild(newSpan);

            } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName === "SPAN") {
                // 자식 span → 부모 스타일 + 자식 스타일 병합
                const mergedSpan = document.createElement("span");

                // 부모 스타일 우선 적용
                mergedSpan.style.cssText = parentStyle.cssText;

                // 그 위에 자식 span 스타일 덮어쓰기
                for (let i = 0; i < child.style.length; i++) {
                    const prop = child.style[i];
                    mergedSpan.style.setProperty(prop, child.style.getPropertyValue(prop));
                }

                mergedSpan.innerHTML = child.innerHTML;
                fragment.appendChild(mergedSpan);

            } else {
                // br 등 다른 노드 그대로 복제
                fragment.appendChild(child.cloneNode(true));
            }
        }

        // 부모 span 제거 후 형제 레벨로 교체
        parent.insertBefore(fragment, span);
        parent.removeChild(span);
    }

    // [전체] 빈 span 제거
    RemoveEmptySpans() 
    {
        const invisibleChars = /[\u200B\u200C\u200D\uFEFF]/g; // 제거할 문자 목록

        const removeRecursive = (node) => {
            for (let child of Array.from(node.childNodes)) {
                if (child.nodeType === Node.ELEMENT_NODE && child.tagName === "SPAN") {
                    removeRecursive(child);

                    // span 텍스트에서 invisible 문자 제거
                    const cleanText = child.textContent.replace(invisibleChars, '').trim();

                    if (!cleanText) {
                        child.parentNode.removeChild(child);
                    }
                }
            }
        };

        removeRecursive(this.text);
    }

    // [전체] 이웃 span끼리 동일한 style이면 병합
    MergeAdjacentSpans() 
    {
        let prevSpan = null;

        for (let child of Array.from(this.text.childNodes)) {
            if (child.nodeType === Node.ELEMENT_NODE && child.tagName === "SPAN") {
                if (prevSpan && prevSpan.style.cssText === child.style.cssText) {
                    prevSpan.textContent += child.textContent;
                    child.parentNode.removeChild(child);
                    continue; // 다시 prevSpan 유지
                }
                prevSpan = child;
            } else {
                prevSpan = null; // span이 아니면 초기화
            }
        }
    }

    // [전체] span이 기본 style이면 text로 변환
    TextFromDefaultStyleSpans() 
    {
        for (let child of Array.from(this.text.childNodes)) {
            if (child.nodeType === Node.ELEMENT_NODE && child.tagName === "SPAN") {
                
                // inline style 자체가 없으면 제거 대상
                if (!child.getAttribute("style")) {
                    const textNode = document.createTextNode(child.textContent);
                    this.text.replaceChild(textNode, child);
                    continue;
                }

                let flagRemove = true;
                for (let styleName in this._style_default) {
                    const value = child.style[styleName];
                    if (value && value !== this._style_default[styleName]) {
                        flagRemove = false;
                        break;
                    }
                }

                if (flagRemove) {
                    const textNode = document.createTextNode(child.textContent);
                    this.text.replaceChild(textNode, child);
                }
            }
        }
    }
}