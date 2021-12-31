<template>
  <div id="app">
    <h1>会词——有道词典单词本打印工具v1.0.0</h1>
    <h1>可将有道词典单词本中收藏的单词打印为word文档</h1>
    <h4>
      使用方法：1、打开PC端“网易有道词典”客户端，进入单词本页面，点击上方齿轮图标，在“导入导出”功能中选择“导出单词”
    </h4>
    <img width="300" src="./assets/export1.png" alt="" />
    <h4>2、选择导出的文件类型为txt格式，文件名随意。</h4>
    <img width="300" src="./assets/export2.png" alt="" />
    <h4>
      3、点击本页面的“选择文件”按钮，选中上一步导出的txt文件，然后即可导出横向或纵向word文档的单词。
    </h4>
    <input type="file" @change="readFile($event)" ref="wordsFile" />
    <div>
      <button :disabled="wordsArr.length == 0" @click="exportDoc('crosswise')">
        横向导出
      </button>
      &nbsp;
      <button :disabled="wordsArr.length == 0" @click="exportDoc('lengthways')">
        纵向导出
      </button>
    </div>
  </div>
</template>

<script>
import docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import JSZipUtils from "jszip-utils";
import { saveAs } from "file-saver";

export default {
  name: "App",
  components: {},
  data: () => {
    return {
      wordsArr: [],
    };
  },
  methods: {
    readFile(e) {
      let that = this;
      console.log(e);
      const file = this.$refs.wordsFile.files[0];

      var reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function () {
        // console.log(this.result);
        that.formatWords(this.result);

        // that.exportDoc(wordsArr);
      };
    },
    formatWords(words) {
      console.log(typeof words);
      const wordsArr = [];
      let wordsFileLine = words.split("\n");
      for (let i = 0; i < wordsFileLine.length - 1; i++) {
        let number = wordsFileLine[i].match(/^[0-9]+/);
        let word = wordsFileLine[i].match(/,\s?([a-z]+)/i);
        let phonogram = wordsFileLine[i].match(/\[.+\]/);
        let explanation = wordsFileLine[i].match(/^[a-z]+\.\s?\S+/);
        explanation = explanation == null ? "" : explanation[0];
        // console.log(explanation);
        // console.log(number, word, phonogram, explanation);
        if (number == null) {
          if (wordsArr.length > 0 && explanation != "") {
            wordsArr[wordsArr.length - 1].explanation.push(explanation);
          }
          continue;
        } else {
          number = number[0];
          word = word == null ? "" : word[1];
          phonogram = phonogram == null ? "" : phonogram[0];
          phonogram = phonogram.replace(/ɪ/g, "I");
          phonogram = phonogram.replace(/ˈ/g, "'");
          phonogram = phonogram.replace(/ˌ/g, ",");
          phonogram = phonogram.replace(/ː/g, ":");
          if (
            wordsArr.length > 0 &&
            Number(wordsArr[wordsArr.length - 1].number) + 1 == number
          ) {
            wordsArr.push({
              number: number + ".",
              phonogram: phonogram,
              word: word,
              explanation: [],
            });
          } else if (wordsArr.length == 0 && Number(number) > 0) {
            wordsArr.push({
              number: number + ".",
              phonogram: phonogram,
              word: word,
              explanation: [],
            });
          }
        }
      }

      console.log(wordsArr);
      this.wordsArr = wordsArr;
      // console.log(wordsFileLine);
      // const wordInfo = {
      //   word:
      // }
      return wordsArr;
    },

    exportDoc(direction) {
      let that = this;
      JSZipUtils.getBinaryContent(
        "/model_" + direction + ".docx",
        function (error, content) {
          // model.docx是模板。我们在导出的时候，会根据此模板来导出对应的数据
          // 抛出异常
          if (error) {
            throw error;
          }

          // 创建一个PizZip实例，内容为模板的内容
          let zip = new PizZip(content);
          // 创建并加载docxtemplater实例对象
          let doc = new docxtemplater().loadZip(zip);
          // 设置模板变量的值
          console.log({ products: that.wordsArr });
          doc.setData({
            products: that.wordsArr,
            // [
            //   { name: "Windows", price: 100 },
            //   { name: "Mac OSX", price: 200 },
            //   { name: "Ubuntu", price: 0 },
            // ],
          });

          try {
            // 用模板变量的值替换所有模板变量
            doc.render();
          } catch (error) {
            // 抛出异常
            let e = {
              message: error.message,
              name: error.name,
              stack: error.stack,
              properties: error.properties,
            };
            console.log(JSON.stringify({ error: e }));
            throw error;
          }

          // 生成一个代表docxtemplater对象的zip文件（不是一个真实的文件，而是在内存中的表示）
          let out = doc.getZip().generate({
            type: "blob",
            mimeType:
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          });
          // 将目标文件对象保存为目标类型的文件，并命名
          saveAs(out, "单词本.docx");
        }
      );
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
