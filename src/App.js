import React, { Component, createRef, useRef } from "react"
// import ReactDOM from "react-dom"
import { TableBody, Header } from './Table'
import _, { create, divide } from "lodash";
// import html2canvas from "html2canvas";
// import Canvas2Image from "canvas2image"
import $ from 'jquery'
// import jsPDF from "jspdf";
import "./style.css"
// import FileSaver from "file-saver";
// import { saveAs } from 'file-saver';
import "./jquery.wordexport"

var paper = {
  width: 595.28, height: 841.89
}
var padding = {
  l: 20,
  r: 25,
  t: 20,
  b: 20
}


// function exportReportTemplet() {

//   var element = document.getElementById("print")
//   setTimeout(() => {


//     var w = element.offsetWidth;    // 获得该容器的宽
//     var h = element.clientHeight;    // 获得该容器的高
//     console.log(element, w, h)
//     // var offsetTop = element.offset().top;    // 获得该容器到文档顶部的距离
//     // var offsetLeft = element.offset().left;    // 获得该容器到文档最左的距离
//     var canvas = document.createElement("canvas");
//     canvas.width = w;    // 将画布宽&&高放大两倍
//     canvas.height = h;
//     var context = canvas.getContext("2d");
//     var scale = 1;
//     context.scale(1, 1);
//     //  context.translate(-offsetLeft - abs, -offsetTop);

//     var opts = {
//       scale: scale,
//       canvas: canvas,
//       width: w,
//       height: h,
//       useCORS: true,
//       background: '#FFF'
//     }
//     console.log(element, opts)

//     html2canvas(element, opts).then(function (canvas) {
//       // allowTaint: false;
//       // taintTest: false;
//       console.log(element)
//       var contentWidth = canvas.width;
//       var contentHeight = canvas.height;
//       //一页pdf显示html页面生成的canvas高度;
//       var pageHeight = contentWidth / 592.28 * 841.89;
//       //未生成pdf的html页面高度
//       var leftHeight = contentHeight;
//       //页面偏移
//       var position = 0;
//       //a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
//       var imgWidth = paper.width;
//       var imgHeight = 592.28 / contentWidth * contentHeight;

//       var pageData = canvas.toDataURL('image/jpeg', 1.0);
//       //   var oCanvas = document.getElementById("print");
//       // Canvas2Image.saveAsJPEG(oCanvas);
//       var pdf = new jsPDF('', 'pt', 'a4');

//       //有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
//       //当内容未超过pdf一页显示的范围，无需分页
//       if (leftHeight < pageHeight) {
//         pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
//       } else {    // 分页
//         while (leftHeight > 0) {
//           pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
//           leftHeight -= pageHeight;
//           position -= paper.height;
//           //避免添加空白页
//           if (leftHeight > 0) {
//             pdf.addPage();
//           }
//         }
//       }
//       pdf.save('销售合同.pdf');
//     })
//   }, 0);
// }



class App extends Component {

  constructor(props) {
    super(props)
    this.printRef = createRef()
  }
  state = {
    wordsArr: [],
    note: "produced by theonlyobserver / 唯一的观测者"
  }

  // pagination() {
  //   setTimeout(() => {
  //     let trs = this.printRef.current.children[0].children[0].children
  //     for (let tr of trs) {
  //       console.log(tr, tr.offsetTop)
  //       let placeholderHeight = paper.height - tr.offsetTop % paper.height
  //       if (placeholderHeight < 30) {
  //         console.log("need placeholder")
  //         let placeholder = document.createElement("div")
  //         placeholder.style.height = placeholderHeight + "px"
  //         placeholder.style.width = 1 + "px"
  //         tr.children[0].append(placeholder)
  //       }

  //     }

  //   }, 0);



  // }

  readFile = (e) => {
    let that = this
    let file = document.querySelector('#file').files[0];


    var reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function () {
      that.setState({
        wordsArr: that.formatWords(this.result)
      }, () => {
        // file.wordExport("111")
        setTimeout(() => { $("#print").wordExport(_.get(that.state.wordsArr, ["0", "tags"], "words")) }, 0)
      }
      )
    };
  }

  formatWords = (words) => {
    let removeRepeatWordAndTranslationFlag = document.getElementById("removeRepeatWordAndTranslation").checked
    let sliceTranslationCount = document.getElementById("sliceTranslation").value
    let wordStringArr = words.split("<item>")
    wordStringArr.shift()
    let wordsArr = []
    for (let wordStringItem of wordStringArr) {
      let wordStringOneLine = wordStringItem.replace(/[\r\n]/g, "");
      let word = _.get((/<word>(.*)<\/word>/g).exec(wordStringItem), ["1"])

      let phonetic = _.get((/<phonetic><!\[CDATA\[(.*)\]\]><\/phonetic>/g).exec(wordStringOneLine), ["1"])
      let lanfrom = _.get((/<lanfrom>(.*)<\/lanfrom>/g).exec(wordStringOneLine), ["1"])
      let lanto = _.get((/<lanto>(.*)<\/lanto>/g).exec(wordStringOneLine), ["1"])
      let tags = _.get((/<tags>(.*)<\/tags>/g).exec(wordStringOneLine), ["1"]);

      let trans = _.get((/<trans><!\[CDATA\[([\s\S]*)\]\]><\/trans>/g).exec(wordStringItem), ["1"]);
      if (removeRepeatWordAndTranslationFlag) {
        trans = this.removeRepeatWordAndTranslation(trans, word)
      }
      if (sliceTranslationCount > 0 && sliceTranslationCount < 100) {
        trans = trans.slice(0, sliceTranslationCount)
      }
      let transArr = trans.split(/[\n]/g)
      //       let transStringCopy = transString
      //       let trans = "";
      //       ["n.", "u.",
      //         "v.", "vbl.", "vt.", "vi.", "aux",
      //         "adj.", "adv.", "art",
      //         "pron.", "prep.", "conj.", "num.",
      //         "interj.", "int."
      //       ].map(item => {
      //         let transStringSplit = transString.split(item)
      //         // console.log(transStringSplit)
      //         if (transStringSplit.length > 1) {
      //           trans += transStringSplit[1] + `
      // `
      //           transString = item + transStringSplit[1]
      //         }
      //       });
      //       if (!trans) {
      //         trans = transStringCopy
      //       }

      //       var myarray = transString.split(/[(n\.)(u\.)(v\.)(vbl\.)]/);
      //       console.log(myarray)
      wordsArr.push({ word, transArr, phonetic, lanfrom, lanto, tags })
    }
    return wordsArr
  };

  handelChange = (event) => {
    this.setState({ note: event.target.value })
  };

  removeRepeatWordAndTranslation = (translation, word) => {
    let sliceEnd = translation.indexOf(word)
    if (sliceEnd > -1) {
      translation = translation.slice(0, sliceEnd)
    }
    return translation
  }

  render() {
    let note = this.state.note
    return (
      <div className="WordSection1">
        <h1 className="content">有道词典单词本打印工具——会词2.0</h1>
        <h1 className="content">可将有道词典单词本中收藏的单词打印为word文档</h1>
        <div className="content">使用方法：1、打开PC端“网易有道词典”客户端，进入单词本页面，点击上方齿轮图标，在“导入导出”功能中选择“导出单词”</div>
        <div className="content"><img className="content" src="1.jpg" width={400}></img></div>
        <div className="content">2、选择导出的文件类型为<span style={{ fontWeight: 600, fontSize: "20px", color: "red" }}>xml格式</span>，文件名随意。</div>
        <div className="content"><img className="content" src="2.jpg" width={400}></img></div>
        <div className="content">3、点击本页面的“选择文件”按钮，选中上一步导出的<span style={{ fontWeight: 600, fontSize: "20px", color: "red" }}>xml文件</span>，然后即可将单词导出为word文档。</div>
        <div style={{ background: '#eee' }}>
          <div className="content" style={{ color: '#aaa' }}>4、可能存在的异常（若无异常请忽略）：
            <div> 【1】若翻译栏中出现对应的英文单词，需删除该单词（及该单词后多余的翻译）<input type="checkbox" id="removeRepeatWordAndTranslation" /> </div>
            <div style={{ display: 'flex', justifyContent: "center" }}>
              <span> 【2】若翻译栏中的文字过多，只想保留指定字符数（会导致翻译内容缺失！） </span>
              <input type="number" style={{ width: '300px' }} placeholder="输入保留的字符数量" id="sliceTranslation" /></div>
          </div>
        </div>
        <div className="content">可添加备注：
          <input onChange={this.handelChange} value={this.state.note} />
        </div>
        <div className="content">  <input type="file" id="file" onChange={this.readFile} ref="wordsFile" /></div>



        <div id="print" ref={this.printRef}>
          <table border="1" cellSpacing="0" >
            <Header title={_.get(this.state.wordsArr, ["0", "tags"])} note={this.state.note}></Header>
            <TableBody id="table" tableData={this.state.wordsArr} paper={paper} printRef={this.printRef} />
          </table>
        </div>
      </div>
    )
  }
}

export default App

