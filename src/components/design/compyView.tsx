import { useEffect, useState } from "react"
import styled from "styled-components"
import { useStore } from "../../zustand/store";

export default function CompyView() {
  const [mouseoverComp, setMouseoverComp] = useState<HTMLElement | undefined>();
  const { selectComp, setSelectComp } = useStore();
  const [zoom, setZoom] = useState(1);
  const [view, setView] = useState<HTMLElement>()

  const handleMouseOver = ({ target }: { target: HTMLElement }) => {
    if (target === selectComp) return; //* selectComp가 mouseoverComp가 되어선 안되기 때문에 제외함
    if (mouseoverComp) mouseoverComp.style.outline = ""; //* 기존 mouseOverComp의 outline을 초기화해줌
    target.style.outline = "rgba(43, 112, 240, 0.4) solid 3px";
    setMouseoverComp(target)
  }

  const handleClick = ({ target }: { target: HTMLElement }) => {
    if (target === selectComp) return; //* target이 selectComp일 경우 굳이 다시 바꿀 필요가 없어서 제외
    if (selectComp) { //* 기존에 선택되어있던 컴포넌트가 있을경우에 초기화 해줌
      selectComp.contentEditable = "false"; //* 글수정 상태에서 바꿀때 그걸 false해줌
      selectComp.style.outline = ""
    }
    if (mouseoverComp) mouseoverComp.style.outline = ""
    setSelectComp(target)
    setMouseoverComp(undefined)
    target.style.outline = "rgba(43, 112, 240, 0.8) solid 3px"
  }

  const viewBgClickEvent = ({ target }: { target: HTMLElement }) => {
    const viewWrapper = document.querySelector("." + ViewWrapper.styledComponentId)
    //* viewWrapper !== target : target이 viewWrapper일 때만 실행해야 이벤트 버블링된 하위 컴포넌트는 실행이 안됨
    if (viewWrapper !== target || !selectComp) return;
    selectComp.contentEditable = "false";
    selectComp.style.outline = "";
    setSelectComp(undefined)
  }
  const handleMouseOut = () => {
    if (mouseoverComp) mouseoverComp.style.outline = "";
    setMouseoverComp(undefined);
  }

  const handleKeyDown = ({ key }: { key: string }) => {
    if (!selectComp || selectComp === view) return; //* view에는 이벤트가 발생하면 안되기에 제외
    if (key === "Delete") selectComp.remove();
  }

  const handleWheel = ({ deltaY }: { deltaY: number }) => {
    const view = document.querySelector("." + View.styledComponentId) as HTMLElement | null
    const viewWrapper = document.querySelector("." + ViewWrapper.styledComponentId) as HTMLElement | null
    const container = document.querySelector("." + Container.styledComponentId)
    const zoomValue = zoom + deltaY * 0.001
    if (view && viewWrapper && container) {
      setZoom(zoomValue)
      view.style.transform = `scale(${zoomValue})`
      viewWrapper.style.width = (view.offsetWidth * zoomValue) + 100 + "px"
      viewWrapper.style.height = (view.offsetHeight * zoomValue) + 100 + "px"
    }
  }

  useEffect(() => {
    const view = document.querySelector("." + View.styledComponentId) as HTMLElement | null
    if (!view) return;
    view.className = `App ${view.className.split(" ")[1]}`
    setView(view)
  }, [])

  return (
    <Container>
      <ViewWrapper
        onClick={viewBgClickEvent}
      // onWheel={handleWheel}
      >
        <View
          onClick={handleClick}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          onKeyDown={handleKeyDown}
          onDoubleClick={() => { console.log("dblclick") }}
          tabIndex="0"
        />
      </ViewWrapper>
    </Container >
  )
}

const Container = styled.div`
  width:calc(100% - 280px - 310px);
  overflow: scroll;
  z-index: 0;
`
const View = styled.div`
  width:360px;
  height:720px;
  background-color: white;
  border-radius: 12px;
  z-index: 2;
`
const ViewWrapper = styled.div`
  display:flex;
  align-items: center;
  justify-content: center;
  min-width:100%;
  min-height:100%;
  width:460px;
  height:820px;
  overflow: scroll;
  z-index: 2;
`