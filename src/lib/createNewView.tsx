import React from "react";
import ReactDOM from "react-dom/client";
import { MouseEventHandler, useState } from "react";
import { useStore } from "../zustand/store";
import { useEffect } from "react";
import { fitHTML, smallerHTML } from "./resize";
import { saveHTML } from "./saveHTML";
import { keyDownFunc } from "./keyDown";
import { normalize as normalizeCss } from "../css/normalize"
import { reset as resetCss } from "../css/reset"

export async function createNewView({ html, style, viewId, id, resize, type }: { html: string, style: string, viewId: string, id?: string, resize?: boolean, type: "design" | "widget" }) {
  const iView = document.getElementById(viewId) as HTMLIFrameElement | null
  const doc = iView?.contentWindow?.document
  if (!doc || doc.body.firstChild) return;
  const main = doc.createElement("div")
  doc.body.appendChild(main)
  const root = ReactDOM.createRoot(main);
  root.render(
    React.createElement(
      NewView,
      { html, style, id, doc, resize, type },
      null
    )
  );
  return main
}

function NewView({ html, style, doc, id, resize, type }: { html: string, style: string, doc: Document, id?: string | string[], resize?: boolean, type: "design" | "widget" }): JSX.Element {
  const { selectComp, setSelectComp } = useStore();
  const [mouseoverComp, setMouseoverComp] = useState<HTMLElement | undefined>();
  const canEditTag = ["H1", "H2", "H3", "H4", "H5", "P", "A"];
  const resetSelectComp = () => {
    if (!selectComp || typeof id !== "string") return; //* 기존에 선택되어있던 컴포넌트가 있을경우에 초기화 해줌
    selectComp.childNodes.forEach(e => {
      if (e.nodeType !== 3) return;
      selectComp.contentEditable = "false"
      saveHTML(id);
    })
    selectComp.style.boxShadow = "";
    selectComp.style.cursor = ""
  }
  const handleMouseOver: MouseEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLElement | null;
    //* view는 이벤트 적용용이라 제외, selectComp가 mouseoverComp가 되어선 안되기 때문에 제외함
    if (!target || target.id === "newView" || target === selectComp) return;
    if (mouseoverComp) mouseoverComp.style.boxShadow = ""; //* 기존 mouseOverComp의 boxShadow을 초기화해줌
    target.style.boxShadow = "inset 0px 0px 0px 2.8px #6cabf3";
    setMouseoverComp(target)
  }

  const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    document.body.blur();
    const target = e.target as HTMLElement | null
    //* target === selectComp : target이 selectComp일 경우 굳이 다시 바꿀 필요가 없어서 제외
    if (!target || target.id === "newView" || target === selectComp) return;
    resetSelectComp();
    if (mouseoverComp) mouseoverComp.style.boxShadow = ""
    setSelectComp(target)
    setMouseoverComp(undefined)
    target.style.boxShadow = "inset 0px 0px 0px 2.8px #2887f4"
  }
  const handleMouseOut = () => {
    if (mouseoverComp) mouseoverComp.style.boxShadow = "";
    setMouseoverComp(undefined);
  }

  const handleDoubleClick = () => {
    if (selectComp && canEditTag.includes(selectComp.tagName)) {
      selectComp.contentEditable = "true";
      selectComp.style.cursor = "text";
    }
  }

  function setupDesign() {
    const view = doc.getElementById("newView")
    if (!view) return;
    view.innerHTML = html
    if (!doc.getElementById("WazWeb")) {
      const styleElem = doc.createElement("style")
      styleElem.id = "WazWeb"
      styleElem.textContent = style
      doc.head.append(styleElem)
    }
    if (resize) smallerHTML(view.childNodes[0] as HTMLElement | null, view, -30)
  }

  function setupDefaultStyle() {
    const normalizeStyle = doc.createElement('style')
    normalizeStyle.textContent = normalizeCss
    doc.head.appendChild(normalizeStyle)
    const resetStyle = doc.createElement('style')
    resetStyle.textContent = resetCss
    doc.head.appendChild(resetStyle)

    const view = doc.getElementById("newView")
    if (!view) return;
    const mainStyle: { [key: string]: string } = { width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }
    if (type === "widget") Object.keys(mainStyle).forEach((key) => view.style[key as any] = mainStyle[key])
  }

  useEffect(() => {
    setupDefaultStyle()
    setupDesign()
  }, [html, id, doc, resize, setSelectComp, style])

  if (type === "widget") return (
    <div id="newView"
      onClick={(e) => { e.preventDefault() }
      }
    />
  )
  return (
    <div
      id="newView"
      tabIndex={0}
      {...keyDownFunc(id)}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onDoubleClick={handleDoubleClick}
    />
  )
}
