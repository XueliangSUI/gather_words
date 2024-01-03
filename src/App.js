import React, { Component, createRef, useRef } from "react"
// import ReactDOM from "react-dom"
import { TableBody, Header } from './Table'
import _, { create, divide } from "lodash";
import { Button, Alert, Snackbar, Grid } from '@mui/material';
import { utils, writeFileXLSX } from "xlsx";
import $ from 'jquery'
// import jsPDF from "jspdf";
import "./style.css"
import "./jquery.wordexport"

import { copyToClipboard } from "./util"

const GLOBAL = {
  momo: "momo",
  shanbei: "shanbei",
  bubei: "bubei",
  baicizhan: "baicizhan"
}

var paper = {
  width: 595.28, height: 841.89
}
var padding = {
  l: 20,
  r: 25,
  t: 20,
  b: 20
}

const dictionaryTypeOption = {
  youdao: "youdao",
  eudic: "eudic"
}

class App extends Component {

  constructor(props) {
    super(props)
    this.printRef = createRef()
    this.alertRef = createRef()
    this.tableRef = createRef()
  }
  state = {
    wordsArr: [],
    note: "produced by theonlyobserver / 唯一的观测者",
    dictionaryType: dictionaryTypeOption.youdao,
    alert: {
      show: false,
      msg: ""
    }

  }

  chooseDictionaryType(type, e,) {
    console.log(e, type)
    this.setState({
      dictionaryType: type
    })
  }
  readFile = (e) => {
    let that = this
    let file = document.querySelector('#file').files[0];
    var reader = new FileReader();
    if (this.state.dictionaryType === dictionaryTypeOption.youdao) {
      reader.readAsText(file);
      reader.onload = function () {
        that.setState({
          wordsArr: that.formatWordsYoudao(this.result)
        }, () => {

        }
        )
      };
    } else if (this.state.dictionaryType === dictionaryTypeOption.eudic) {
      reader.readAsText(file, 'utf-8');
      reader.onload = function () {
        let domparser = new DOMParser()
        let htmlDOM = domparser.parseFromString(reader.result, "text/html")
        let tbody = htmlDOM.querySelector("tbody")
        let trArr = tbody.querySelectorAll("tr")
        let wordObjArr = []
        _.map(trArr, (trItem, trIndex) => {
          console.log(trItem)
          let tdArr = trItem.querySelectorAll("td")
          let sliceEnd = trItem.querySelector(".expDiv").innerHTML.indexOf("<br><br>")
          let translation = trItem.querySelector(".expDiv").innerHTML.replace(/&gt;/g, ">").replace(/&lt;/g, "<")
          if (sliceEnd > -1) {
            translation = trItem.querySelector(".expDiv").innerHTML.slice(0, sliceEnd)
          }
          let wordObj = {
            id: trIndex + 1,
            word: tdArr[1].innerHTML,
            phonetic: tdArr[2].innerHTML,
            transArr: translation.replace(/&gt;/g, ">").replace(/&lt;/g, "<").split("<br>")
          }
          wordObjArr.push(wordObj)
        })
        that.setState({
          wordsArr: wordObjArr
        }, () => {

        }
        )
      };
    }

  }

  formatWordsYoudao = (words) => {
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

  csvJSON(csv) {
    var lines = csv.split("\n");
    var result = [];
    var headers = lines[0].split(",");
    for (var i = 1; i < lines.length; i++) {
      var obj = {};
      var currentline = lines[i].split(",");
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
      }
      result.push(obj);
    }

    return result;
  }


  handelChange = (event) => {
    this.setState({ note: event.target.value })
  };

  removeRepeatWordAndTranslation = (translation, word) => {
    let sliceEnd = translation.toLowerCase().indexOf(word.toLowerCase())
    if (sliceEnd > -1) {
      translation = translation.slice(0, sliceEnd)
    }
    return translation
  }

  exportToWord() {
    if (this.state.dictionaryType === dictionaryTypeOption.youdao) {
      setTimeout(() => { $("#print").wordExport(_.get(this.state.wordsArr, ["0", "tags"], "words")) }, 0)
    } else if (this.state.dictionaryType === dictionaryTypeOption.eudic) {
      var fileName = $("#file").val();
      var strFileName = fileName.substring(fileName.lastIndexOf("\\") + 1).slice(0, -5);
      setTimeout(() => { $("#print").wordExport(strFileName || "word") }, 0)
    }
  }

  // 导出到墨墨/不背单词。从整理好的单词对象数组中仅获取单词
  exportToVocabularyApps = (list, appName) => {
    if (appName === GLOBAL.momo) {
      let wordsAsString = _.map(list, (item) => {
        return _.get(item, "word")
      }).join("\n")
      copyToClipboard(wordsAsString)
      alert("墨墨单词本已复制到剪切板，请直接粘贴使用，例如通过QQ或微信发送给手机。")
    } else if (appName === GLOBAL.bubei) {
      let wordsAsString = _.map(list, (item) => {
        return _.get(item, "word")
      }).join("\n")
      copyToClipboard(wordsAsString)
      alert("不背单词已复制到剪切板，请访问不背单词官网使用。注：不背单词当前不支持小于20个词的单词本")
    } else if (appName === GLOBAL.shanbei) {
      let wordsAsString = _.map(list, (item) => {
        return _.get(item, "word")
      }).join("\n")
      copyToClipboard(wordsAsString)
      alert("扇贝单词已复制到剪切板，请访问扇贝单词官网使用。注：扇贝单词单次至多可导入100个")
    } else if (appName === GLOBAL.baicizhan) {
      let wordsAsString = _.map(list, (item) => {
        return _.get(item, "word")
      }).join(",")
      copyToClipboard(wordsAsString)
      alert("百词斩单词已复制到剪切板，请直接粘贴使用，例如通过QQ或微信发送给手机。")
    }

  }







  render() {
    return (
      <div className="WordSection1">
        <div className="content">
          <h1 >词典单词本打印及导入背单词app——会词6.0</h1>
          <h1 >可将有道/欧路词典单词本中收藏的单词打印为Word/Excel文档或导出至墨墨、扇贝、百词斩、不背等背单词App</h1>
          <h5>若遇到功能异常，请检查 1、从词典里导出的单词本的文件格式是否符合要求。 2、推荐使用Chrome/edge/360极速浏览器。3、若使用非微软的office软件打开导出的word/excel文件可能会造成排版混乱。4、检查有道/欧路词典是否为最新版本。5、若有无法排查的功能异常请在视频评论区留言或私信哔哩哔哩 唯一的观测者</h5>
        </div>
        <div className="content background_grey">
          <h5 >一、选择词典类型</h5>
          <div className="image_flex">
            <img className={`image_flex_img ${this.state.dictionaryType === dictionaryTypeOption.youdao ? "image_selected" : ""} `} onClick={this.chooseDictionaryType.bind(this, dictionaryTypeOption.youdao)} src="image_youdao_logo.jpg"></img>
            <img className={`image_flex_img ${this.state.dictionaryType === dictionaryTypeOption.eudic ? "image_selected" : ""} `} onClick={this.chooseDictionaryType.bind(this, dictionaryTypeOption.eudic)} src="image_eudic_logo.jpg"></img>
          </div>
        </div>

        <div className="content">
          <h5 >二、从词典中导出指定格式文件</h5>
          {
            this.state.dictionaryType === dictionaryTypeOption.youdao ?
              (<div >
                <div >使用方法：1、打开PC端“网易有道词典”客户端，进入单词本页面，点击上方齿轮图标，在“导入导出”功能中选择“导出单词”</div>
                <div ><img src="1.jpg" width={400}></img></div>
                <div >2、选择导出的文件类型为<span style={{ fontWeight: 600, fontSize: "20px", color: "red" }}>xml格式</span>，文件名随意。</div>
                <div ><img src="2.jpg" width={400}></img></div>
                <div >3、点击本页面最下方的“选择文件”按钮，选中上一步导出的<span style={{ fontWeight: 600, fontSize: "20px", color: "red" }}>xml文件</span>，然后即可将单词导出为word文档。</div>


                <div style={{ color: '#aaa' }}>4、可能存在的异常（若无异常请忽略）：
                  <div> 【1】若翻译栏中出现对应的英文单词，需删除该单词（及该单词后多余的翻译）<input type="checkbox" id="removeRepeatWordAndTranslation" /> </div>

                  <span> 【2】若翻译栏中的文字过多，只想保留指定字符数（会导致翻译内容缺失！） </span>
                  <input type="number" style={{ width: '300px' }} placeholder="输入保留的字符数量" id="sliceTranslation" />
                </div>

              </div>)
              :
              (<div >
                <div >使用方法：1、如图所示，注意导出格式为“HTML”、“简明解释”</div>
                <div ><img src="image_eudic_step1.jpg" width={1300}></img></div>
                <div >2、点击本页面最下方的“选择文件”按钮，选中上一步导出的<span style={{ fontWeight: 600, fontSize: "20px", color: "red" }}>html文件</span>，然后即可将单词导出为word文档。</div>

              </div>
              )
          }
        </div>
        <div className="content background_grey">
          <h5 >三、导入上一步导出的文件</h5>
          <div >
            <input type="file" id="file" onChange={() => { this.readFile() }} ref="wordsFile" />
          </div>
          <div >可添加备注：
            <input onChange={this.handelChange} value={this.state.note} />
          </div>



        </div>
        <div className="content ">
          <h5 >四、选择导出方式</h5>
          <div >
            <Button variant="contained" onClick={() => { this.exportToWord() }}>
              导出为word文档
            </Button>
            <Button variant="contained" className="export_button" onClick={() => {
              const wb = utils.table_to_book(this.tableRef.current);
              writeFileXLSX(wb, _.get(this.state.wordsArr, ["0", "tags"], "words") + ".xlsx");
            }}>
              导出为Excel文档
            </Button>

            <Button variant="contained" className="export_button" onClick={() => { this.exportToVocabularyApps(this.state.wordsArr, GLOBAL.momo) }}>
              <img src="momo.webp" className="export_to_logo"></img>导出至墨墨背单词
            </Button>
            <Button variant="contained" className="export_button" onClick={() => { this.exportToVocabularyApps(this.state.wordsArr, GLOBAL.bubei) }}>
              <img src="bubei.webp" className="export_to_logo"></img> 导出至不背单词
            </Button>
            <a href="https://www.bbdc.cn/">不背单词官网</a>
            <Button variant="contained" className="export_button" onClick={() => { this.exportToVocabularyApps(this.state.wordsArr, GLOBAL.shanbei) }}>
              <img src="shanbei.webp" className="export_to_logo"></img>导出至扇贝单词
            </Button>
            <a href="https://web.shanbay.com/web/account/login/">扇贝单词官网</a>
            <Button variant="contained" className="export_button" onClick={() => { this.exportToVocabularyApps(this.state.wordsArr, GLOBAL.baicizhan) }}>
              <img src="baicizhan.webp" className="export_to_logo"></img> 导出至百词斩
            </Button>
          </div>
        </div>

        <div className="content background_grey">
          <h5 >五、手动复制及在线预览</h5>
          <div className="manually_copy_word_wrap_wrap">
            <div>


              <div className="manually_copy_word_wrap">
                可手动复制到墨墨、不背、扇贝单词：
                {
                  _.map(this.state.wordsArr, (item) => <div>{_.get(item, "word")}</div>)
                }
              </div>
            </div>
            <div>

              <div className="manually_copy_word_wrap">
                可手动复制到百词斩：
                {
                  _.map(this.state.wordsArr, (item) => <>{_.get(item, "word")},</>)
                }
              </div>
            </div>
          </div>

          <div id="print" ref={this.printRef}>
            <table border="1" cellSpacing="0" ref={this.tableRef}>
              <Header title={_.get(this.state.wordsArr, ["0", "tags"])} note={this.state.note}></Header>
              <TableBody id="table" tableData={this.state.wordsArr} paper={paper} printRef={this.printRef} />
            </table>
          </div>
        </div>

      </div >
    )
  }
}

export default App

