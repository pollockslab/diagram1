
import {_MAN, _MEU, _GRD, _IFO, _WIN, _EDT, _STO} from "../main/main.js"

export class _MAIN
{
    constructor()
    {
    }

    async Init()
    {
        // 마우스 이벤트 창 생성
        this.div = document.createElement("div");
        // this.div.draggable = "false";
        this.div.id = "event_div";
        this.div.style = "position:absolute; " +
                         "top:0px; left:0px; width: 100%; height: 100%; " +
                         "z-index: 1000;";
        document.body.appendChild(this.div);

        this.div.addEventListener("contextmenu", async (e) => 
        {
            e.preventDefault();
        });
        // 맵 확대,축소 및 접속
        this.div.addEventListener("wheel", (e) => 
        {
            if(e.deltaY > 0) {
                _WIN.zoom += 0.2;
            }
            else if(e.deltaY < 0) {
                _WIN.zoom -= 0.2;
            }
            else {return;}

            _WIN.Resize();
            _WIN.Draw();
            
        }, {passive: true});
        
        this.div.addEventListener("mousedown", async (e) => 
        {
            e.preventDefault();
            const spaceX = _WIN.SpaceX(e.offsetX);
            const spaceY = _WIN.SpaceY(e.offsetY);

            this.down = {};
            this.down.timeStamp = e.timeStamp;
            this.down.offsetX = e.offsetX;
            this.down.offsetY = e.offsetY;

            this.win = {};
            this.win.spaceX = _WIN.x;
            this.win.spaceY = _WIN.y;

            const collide = _WIN.IsCollision(spaceX, spaceY);
            const rootItem = collide.GetRoot();
            this.collide = {};
            this.collide.item = collide;
            this.collide.root = rootItem;
            this.collide.spaceX = rootItem.x;
            this.collide.spaceY = rootItem.y;
            this.collide.spaceWidth = rootItem.width;
            this.collide.spaceHeight = rootItem.height;
            this.collide.edge = this.EdgeCheck(spaceX, spaceY, rootItem);

            // root가 window가 아닐경우 상단으로 보이게 위로 올리자
            if(collide && collide.type != "window")
            {
                // 1. window.child 배열순서 바꾸기
                if(_WIN.MoveChild(rootItem))
                {
                    // 2. indexeddb space 순서 바꾸기
                    await _GRD.UpdateSpace();
                    _WIN.Draw();
                }
            }
        });

        this.div.addEventListener("mousemove", (e) => 
        {
            // 상자 모서리 마우스커서 이미지 변경 시작
            const spaceX = _WIN.SpaceX(e.offsetX);
            const spaceY = _WIN.SpaceY(e.offsetY);
            const collide = _WIN.IsCollision(spaceX, spaceY);

            if(collide && collide.type != "window")
            {
                const rootItem = collide.GetRoot();
                const edge = this.EdgeCheck(spaceX, spaceY, rootItem);
                this.div.style.cursor = edge.cursor;

                // if(rootItem.type === "picture")
                // {
                //     // 보더 그려보자
                //     _WIN.DrawBorder(rootItem.x, rootItem.y, rootItem.width, rootItem.height, "green");
                // }
                _WIN.DrawBorder(rootItem.x, rootItem.y, rootItem.width, rootItem.height, "green");
            }
            else {
                this.div.style.cursor = "default";
                _WIN.ClearBorder();
            }
            // 상자 모서리 마우스커서 이미지 변경 종료

            if(!this.down) {return;}
            
            const rangeX = _WIN.WindowToSpace(e.offsetX-this.down.offsetX);
            const rangeY = _WIN.WindowToSpace(e.offsetY-this.down.offsetY);

            // 모서리 눌러서 상자크기 조절
            if(this.collide.edge && this.collide.edge.cursor != "default")
            {
                this.ResizeSquare(rangeX, rangeY, this.collide);
                this.collide.root.Draw();
            }
            // 상자 탭바 눌러서 이동
            else if(this.collide.item.isDrag == true)
            {
                this.collide.root.Load({
                    x: this.collide.spaceX + rangeX,
                    y: this.collide.spaceY + rangeY
                });
            }
            // 그 외 눌러서 화면이동
            else
            {
                _WIN.x = this.win.spaceX - rangeX;
                _WIN.y = this.win.spaceY - rangeY;
            }
           
            _WIN.Draw();
        });

        this.div.addEventListener("mouseup", async (e) => 
        {
            if(!this.down) {return;}
            const spaceX = _WIN.SpaceX(e.offsetX);
            const spaceY = _WIN.SpaceY(e.offsetY);
            
            // 0.2초 이하면 클릭
            const isClick = (e.timeStamp - this.down.timeStamp <= 200)? true:false;
            this.down = null; // down 초기화

            if(isClick && _MEU.toggle)
            {
                await _MEU[_MEU.toggle.key](this.collide.root, spaceX, spaceY);
            }
            else if(isClick && this.collide.root.type != "window" &&
                this.collide.root.type != "line") 
            {
                this.collide.item.Event("onClick", this.collide); // 2번째 파라미터는 정보
            }
            else if(this.collide.root.type != "window")
            {
                // 그룹체크
                const group = _WIN.GetCollisionGroup(this.collide.root);
                if(this.collide.root.type === "group") 
                {
                    const gGroup = this.collide.root;
                    for(let i=0; i<gGroup.info.groupping.length; i++){
                        const gKey = gGroup.info.groupping[i];
                        const gItem = _WIN.FindChild(gKey);
                        if(!gItem) {
                            await _STO.SaveDiagram(gItem);        
                        }
                    }
                }
                else if(group) {
                    group.AddGroup(this.collide.root);
                    await _STO.SaveDiagram(group);  
                }
                else if(this.collide.root.group) {
                    const dGroup = this.collide.root.group;
                    dGroup.RemoveGroup(this.collide.root);
                    await _STO.SaveDiagram(dGroup);  
                    console.log("떨어졌다");
                }
                console.log("여기")
                // 바뀐게 없는데도 저장하고 있다
                await _STO.SaveDiagram(this.collide.root);
            }

            
            _WIN.Draw();
            
        });

        this.div.addEventListener("mouseleave", async (e) => 
        {
            if(!this.down) {return;}
            // 메모 늘리는중에 화면밖 벗어나면 늘린길이 저장
            if(this.down && this.collide && this.collide.root.type != "window")
            {
                await _STO.SaveDiagram(this.collide.root);
            }
            this.down = null;
            // this.Hover();
        });
        this.div.addEventListener("dragover", async (e) => 
        {
            if (!e.dataTransfer.types.includes("Files")) return; 
            e.preventDefault();
        });

        this.div.addEventListener("drop", async (e) => 
        {
            if (!e.dataTransfer.types.includes("Files")) return;
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if(!file) return;

            const spaceX = _WIN.SpaceX(e.offsetX);
            const spaceY = _WIN.SpaceY(e.offsetY);

            // 이미지
            if(file.type.startsWith("image/")) {
                const isPictureSize = true;
                await _GRD.Add(null, "picture", {x: spaceX, y: spaceY, file: file}, isPictureSize);
            }
            // 오디오
            else if(file.type.startsWith("audio/")) {

            }
            else {
                
            }
            _WIN.Draw();
        });
    }

    get work()
    {
        return this._work;
    }
    /**
     * [type]
     * default: map move,
     * square: square make
     * line: line make
     */
    set work(type)
    {
        this._work = type;
    }

    // 도형 및 라인에 hover 기능
    Hover(offsetX, offsetY)
    {
        if(!offsetX || !offsetY) {
            _WIN.Draw();
            this.move.hover = null;
            return;
        }
        const square = _GRD.FindToPos(_WIN.SpaceX(offsetX), _WIN.SpaceY(offsetY));
        if(square != this.move.hover) {
            _WIN.Draw();
            if(square) {
                // square.DrawHover();
                if(square.IsTitleClick(offsetX, offsetY)) {
                    square.DrawHoverTitle();
                }
                else if(square.IsContentClick(offsetX, offsetY)) {
                    square.DrawHoverContent();
                }
            }
        }
        this.move.hover = square;
        // isCollision 이 에매하다. 기준이. win.x, win.y 가 움직였는데 못잡아
        // const collide = _WIN.IsCollision(_WIN.SpaceX(offsetX), _WIN.SpaceY(offsetY));
        
        // if(collide && collide.type != "window") {
        //     _WIN.DrawBorder(collide.rootX, collide.rootY, collide.width, collide.height);
        // }
        // else {
        //     _WIN.ClearBorder();
        // }
    }

    // 상자 모서리에 마우스 커서가 올라가 있는지 체크
    EdgeCheck(spaceX, spaceY, square)
    {
        const range = 10;
        // 좌표가 상자 안에 들어있는지 체크
        if(square.x > spaceX+range || square.x+square.width < spaceX-range ||
            square.y > spaceY+range || square.y+square.height < spaceY-range)
        {return null;}
            
        let compass = "";
        let cursor = "default"; // 기본 화살표

        if(Math.abs(square.y - spaceY) < range) compass += "n"; // 상
        if(Math.abs(square.x + square.width - spaceX) < range) compass += "e"; // 우
        if(Math.abs(square.y + square.height - spaceY) < range) compass += "s"; // 하
        if(Math.abs(square.x - spaceX) < range) compass += "w"; // 좌
     
        if(compass == "nw" || compass == "es") cursor = "nwse-resize"; // 좌상우하 화살표
        else if(compass == "sw" || compass == "ne") cursor = "nesw-resize"; // 우상좌하 화살표
        else if(compass == "e" || compass == "w") cursor = "ew-resize"; // 좌우 화살표
        else if(compass == "n" || compass == "s") cursor = "ns-resize"; // 상하 화살표
        
        return {compass, cursor};
    }

    // this.collide.edge.compass, this.collide.root);
    ResizeSquare(x, y, collide)
    {
        if(!collide || !collide.edge || collide.edge == "default") {return;}
        const square = collide.root;
        const info = {};

        switch(collide.edge.compass)
        {
            case "nw": // 북서
                info.x = collide.spaceX + x;
                info.y = collide.spaceY + y;
                info.width = collide.spaceWidth - x;
                info.height = collide.spaceHeight - y;
                break;
            case "es": // 동남
                info.width = collide.spaceWidth + x;
                info.height = collide.spaceHeight + y;
                break;
            case "sw": // 남서
                info.x = collide.spaceX + x;
                info.width = collide.spaceWidth - x;
                info.height = collide.spaceHeight + y;
                break;
            case "ne": // 북동
                info.y = collide.spaceY + y;
                info.width = collide.spaceWidth + x;
                info.height = collide.spaceHeight - y;
                break;
            case "e": // 동
                info.width = collide.spaceWidth + x;
                break;
            case "w": // 서
                info.x = collide.spaceX + x;
                info.width = collide.spaceWidth - x;
                break;
            case "n": // 북
                info.y = collide.spaceY + y;
                info.height = collide.spaceHeight - y;
                break;
            case "s": // 남
                info.height = collide.spaceHeight + y;
                break;
        }
        square.Load(info);
    }
}