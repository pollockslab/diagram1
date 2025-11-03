import {_MOD, _CONFIG} from "../../diagram/diagram.js"
import {_WIN, _GRD} from "../main/main.js"

export class _MAIN
{
    constructor()
    {
        this.toggle = null;
    }

    async Init()
    {
        
        this.parentElement.host.style.opacity = 1;
        this.btnList = [
            {key: "onHide",         type: "action", src:"/icon/menu.svg", tooltip:"리모콘 숨기기"},
            {key: "onMemo",       type: "toggle", src:"/icon/add_square.png", tooltip:"메모추가"},
            {key: "onLine",         type: "toggle", src:"/icon/circuit.png", tooltip:"라인추가"},
            // {key: "onFullscreen",   type: "action", src:"/resource/icon/circuit.png", tooltip:"전체화면on/off"},
            {key: "onSquare",      type: "toggle", src:"/icon/square.png", tooltip:"상자추가"},
            {key: "onFavorite",     type: "toggle", src:"/menu/favorite.png", tooltip:"즐겨찾기 추가"},
            {key: "onMultiselect",  type: "toggle", src:"/menu/multiselect.png", tooltip:"다중선택"},
            {key: "onPicture",      type: "toggle", src:"/menu/picture.png", tooltip:"그림추가"},
            {key: "onGroup",        type: "toggle", src:"/menu/group.png", tooltip:"그룹추가"},
            {key: "onRemove",       type: "toggle", src:"/menu/remove.png", tooltip:"상자삭제"},
            {key: "onImageDownload",type: "action", src:"/menu/imageDownload.png", tooltip:"현재화면 이미지저장"},
            // 그룹추가 --> 그룹 칸에 제목수정부분 넣고, 안에 메모, 이미지 넣으면 들어가게
            //  ㄴ 메모, 이미지등 드래그로 추가가능, 밖으로 빼기도 가능. 보더밝게해서 표시
            //  ㄴ 라인 이어진건 밖이랑 연동해야지
            // 이미지추가 --> 이미지등록후 위에 마우스 드래그로 그림 그리는 기능
            // 돋보기 플러스 마이너스 좌우버튼(스크롤 안되는걸 대비해서)
            // 삭제하기
            // 스페이스 이동 (최상단:경로1:경로2:현재경로). 상자스페이스 접속은 고민해보자
            // 가져오기 (메모다이어그램 등록한 파일목록 보며)
            // 내보내기 (메모다이어그램 등록한 파일목록 보며)
            // 즐겨찾기
            // 상단탭을 만들면 지저분해질까봐 좀 그런데...
            // 엄청 많아진다 하면 계속 쌓이는구조
            // 로컬도 아니라 삭제하면 어디 관리도 힘든데
            // 불러오기를 만든다?
            // 다이어그램 매니저 팝업을 띄워서 목록을 보여주자
            // 거기서 더블클릭 하던 해서 탭에 넣어도 되지 않을까
            // 탭이 없으면 불편할거같고. 근데 탭이 있으면 취지에 안맞을까싶고
            // 만들고나서. 이상하면 빼자
        ];
        
        // 버튼객체 생성
        for(const btn of this.btnList) {
            btn.item = await _MOD.button.create(_CONFIG.dir.resource + btn.src, ["button"], this.parentElement);
            btn.item.title = btn.tooltip ?? "";
        }

        // 이벤트
        this.parentElement.host.addEventListener("click", (e) =>
        {
            this.RemoveToggle();
        });
        this.parentElement.addEventListener("click", (e) =>
        {
            e.stopPropagation(); // 부모패널로 이벤트전파 막기
            
            const find = this.Find(e.target);
            // 기존에 다른버튼 눌렀나 체크. 눌렀으면 현재 누른거로 변경
            if(this.toggle && this.toggle != find) { 
                this.toggle.item.classList.remove("checked");
                this.toggle = null;
            }

            if(!find) {return;} 
            else if(find.type === "toggle") {
                const checked = find.item.classList.toggle("checked");
                this.toggle = checked? {key:find.key, item:find.item} : null; // ?? 이거 이해가 안되는데
            }
            else if(find.type === "action") {
                this[find.key]();
            }
        }); 
    }

    Find(target)
    {
        for(const btn of this.btnList) {
            if(btn.item == target) return btn;
        }
    }
    RemoveToggle()
    {
        // 2. 토글 초기화
        if(this.toggle) {
            this.toggle.item.classList.remove("checked");
            this.toggle = null;
        }
    }

    onHide()
    {
        // await _GRD.SpaceOut();
        // _WIN.Draw();
        this.parentElement.host.style.opacity = 
            (this.parentElement.host.style.opacity == 1)? 0 : 1;
        
    }
    
    onFullscreen()
    {
        if(!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        }
        else {
            document.exitFullscreen();
        }
    }

    async onGroup(square, spaceX, spaceY)
    {
        // 1. 상자생성
        const add = await _GRD.Add(null, "group", {x: spaceX, y: spaceY});
        
        // 2. 토글 초기화
        this.RemoveToggle();
    }

    async onMemo(square, spaceX, spaceY)
    {
        // 1. 상자생성
        const add = await _GRD.Add(null, "memo", {x: spaceX, y: spaceY});
        
        // 2. 토글 초기화
        this.RemoveToggle();
    }

    async onSquare(square, spaceX, spaceY)
    {
        // 1. 상자생성
        const add = await _GRD.Add(null, "square", {x: spaceX, y: spaceY});
        
        // 2. 토글 초기화
        this.RemoveToggle();
    }

    async onPicture(square, spaceX, spaceY)
    {
        // 1. 상자생성
        const add = await _GRD.Add(null, "picture", {x: spaceX, y: spaceY});
        
        // 2. 토글 초기화
        this.RemoveToggle();
    }

    async onLine(square, spaceX, spaceY)
    {
        if(square.type === "window") {}
        // 1. 처음 누를때 this.toggle 에 square 등록
        else if(!this.toggle.square1) {
            this.toggle.square1 = square;
            return;
        }
        else {
            const square1 = this.toggle.square1;
            const square2 = square;
            if(square1 == square2) {}
            else {
                // 이미 둘간의 라인이 있으면 기존거 삭제하고 새로 넣기
                for(let i=0; i<_WIN.children.length; i++)
                {
                    const diagram = _WIN.children[i];
                    if( (diagram.square1 == square1 && diagram.square2 == square2) ||
                        (diagram.square1 == square2 && diagram.square2 == square1)) 
                    {
                        // 이참에 있는거 다 정리개념으로 끝까지 돌며 삭제
                        await _GRD.DeleteLine(diagram);
                        i--;
                    }
                }

                // 2. 두번째 누를때 들어온 square 랑 연결하는 선 생성
                const add = await _GRD.Add(null, "line", 
                    {squareKey1: square1.key, squareKey2: square2.key}
                );
            }
        }
        this.RemoveToggle();
    }

    async onRemove(square, spaceX, spaceY)
    {
        if(square.type === "window") {
            this.RemoveToggle();
            return;
        }

        // 1. 상자제거
        await _GRD.DeleteSquare(square);
        
        // 2. 토글 초기화
        this.RemoveToggle();
    }

    async onMultiselect(square, spaceX, spaceY)
    {
        // 이동을 위해서 다중선택하는 기능
    }

    async onFavorite(square, spaceX, spaceY)
    {
        // 이동을 위해서 다중선택하는 기능
        console.log("즐찾", square);

        // 1. 즐찾DB 등록

        // 2. 즐찾패널 갱신할까 추가만 할까(추가만 하자)

        // 3. 토글 초기화
        this.RemoveToggle();
    }

    async onImageDownload(square, spaceX, spaceY)
    {
        const link = document.createElement("a");
        link.download = "download.jpg";
        link.href = _WIN.cav.toDataURL("image/jpeg");
        link.click();
    }
}