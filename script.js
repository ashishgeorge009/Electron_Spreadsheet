const $ = require("jquery");
const fs = require("fs");
const dialog = require("electron").remote.dialog;

$(document).ready(function(){
    let db;
    let lsc;
    $(".menu").on("click", function () {
        let Id = $(this).attr("id");
        // console.log("clicked");
        // File
        $(".menu-options").removeClass("selected");
        $(`#${Id}-menu-options`).addClass("selected");
    })

    $(".content-container").on("scroll", function(){
        let scrollY = $(this).scrollTop();
        let scrollX = $(this).scrollLeft();
        // console.log(scrollY);
        $("#top-row, #top-left-cell").css("top", scrollY+"px");
        $("#left-col, #top-left-cell").css("left", scrollX+"px");
    })
    $("#grid .cell").on("keyup", function(){
        let {rowId} = getrc(this);
        let ht = $(this).height(); //geting height of css
        $($("#left-col .cell")[rowId]).height(ht);
    })
//Designing-----------------------------------
    let lcell;
    $("#grid .cell").on("click", function(){
        let {colId , rowId} = getrc(this);
        let cellObj = getcell(this);
        let value = String.fromCharCode(65+colId)+(rowId+1);
        $("#address-input").val(value);
        $("#formula-input").val(cellObj.formula);
        $("#bg-color").val(cellObj.bgColor);
        $("#text-color").val(cellObj.textColor);

        if (lcell && this != lcell) {
            $(lcell).removeClass("selected");
        }           
        $(this).addClass("selected");    
        if (cellObj.bold) {
            $("#bold").addClass("isOn")
        } else {
            $("#bold").removeClass("isOn")
        }
        if (cellObj.italic) {
            $("#italic").addClass("isOn")
        } else {
            $("#italic").removeClass("isOn")
        }
        if (cellObj.underline) {
            $("#underline").addClass("isOn")
        } else {
            $("#underline").removeClass("isOn")
        }
        ///if statements of align------
        if (cellObj.halign == "left") {
            $("input[value='L']").addClass("isOn");
            $("input[value='C']").removeClass("isOn");
            $("input[value='R']").removeClass("isOn");
        } else if(cellObj.halign == "center") {
            $("input[value='L']").removeClass("isOn");
            $("input[value='C']").addClass("isOn");
            $("input[value='R']").removeClass("isOn");
        }
        else if(cellObj.halign == "right") {
            $("input[value='L']").removeClass("isOn");
            $("input[value='C']").removeClass("isOn");
            $("input[value='R']").addClass("isOn");

        }
        else{
            console.log("Alignment not defined changing to left");
            $("input[value='L']").addClass("isOn");
            $("input[value='C']").removeClass("isOn");
            $("input[value='R']").removeClass("isOn");
            cellObject.halign = "left";
        }
        //-------------
        lcell = this;
    })
//---------bold-------------
    $("#bold").on("click", function () {
        $(this).toggleClass("isOn");
        let isBold = $(this).hasClass("isOn");
        $("#grid .cell.selected").css("font-weight", isBold ? "bolder" : "normal");
        let cellElem = $("#grid .cell.selected");
        let cellObject = getcell(cellElem);
        cellObject.bold = isBold;
    })
//--------------------italics-----------
    $("#italic").on("click", function () {
        $(this).toggleClass("isOn");
        let isItalic = $(this).hasClass("isOn");
        $("#grid .cell.selected").css("font-style", isItalic ? "italic" : "normal");
        let cellElem = $("#grid .cell.selected");
        let cellObject = getcell(cellElem);
        cellObject.italic = isItalic;
    })
//---------------underline-----------------------
    $("#underline").on("click", function () {
        $(this).toggleClass("isOn");
        let isUnd = $(this).hasClass("isOn");
        // console.log(isUnd);
        $("#grid .cell.selected").css("text-decoration", isUnd ? "underline" : "none");
        let cellElem = $("#grid .cell.selected");
        let cellObject = getcell(cellElem);
        cellObject.underline = isUnd;
    })
////********The alignment----------- */
    $("input[value='L']").on("click", function () {
        $(this).addClass("isOn");
        $("input[value='C']").removeClass("isOn");
        $("input[value='R']").removeClass("isOn");
        // let isLeft = $(this).hasClass("isOn");
        let cellElem = $("#grid .cell.selected");
        let cellObject = getcell(cellElem);
        $("#grid .cell.selected").css("text-align", "left" );
        cellObject.halign = "left";
    })
    $("input[value='C']").on("click", function () {
        $(this).addClass("isOn");
        $("input[value='L']").removeClass("isOn");
        $("input[value='R']").removeClass("isOn");
        // let isCenter = $(this).hasClass("isOn");
        let cellElem = $("#grid .cell.selected");
        let cellObject = getcell(cellElem);
        $("#grid .cell.selected").css("text-align", "center");
        cellObject.halign = "center";
    })
    $("input[value='R']").on("click", function () {
        $(this).addClass("isOn");
        $("input[value='C']").removeClass("isOn");
        $("input[value='L']").removeClass("isOn");
        // let isRight = $(this).hasClass("isOn");
        let cellElem = $("#grid .cell.selected");
        let cellObject = getcell(cellElem);
        $("#grid .cell.selected").css("text-align", "right");
        cellObject.halign = "right";
    })
//-----------------fontfamily------------
    $("#font-family").on("change", function () {
        let fontFamily = $(this).val();
        $("#grid .cell.selected").css("font-family", fontFamily);
        let cellElem = $("#grid .cell.selected");
        let cellObject = getcell(cellElem);
        cellObject.fontFamily = fontFamily
    })
//-----------bg-color--------------
    $("#bg-color").on("change", function () {
        let bgColor = $(this).val();
        let cellElem = $("#grid .cell.selected");
        cellElem.css("background-color", bgColor);
        let cellObject = getcell(cellElem);
        cellObject.bgColor = bgColor
    })
//----text-color-----
    $("#text-color").on("change", function () {
        let txtColor = $(this).val();
        let cellElem = $("#grid .cell.selected");
        cellElem.css("color", txtColor);
        let cellObject = getcell(cellElem);
        cellObject.textColor = txtColor;
    })
//------font-size--------------------
    $("#font-size").on("change", function(){
        let fontSize = Number($(this).val());
        let cellElem = $("#grid .cell.selected");
        cellElem.css("font-size", fontSize);
        let cellObject = getcell(cellElem);
        cellObject.fontSize = fontSize;
    })


//new file*************************************************************************
    $("#New").on("click", function(){
        db =[];
        let AllRows = $("#grid").find(".row");
        for(let i=0;i<AllRows.length;i++){
            let AllCols = $(AllRows[i]).find(".cell");
            let row =[];
            for(let j=0; j<AllCols.length;j++){
                let cell = {
                    value :"",
                    formula:"",
                    downstream: [],
                    upstream: [],
                    bold: false,
                    underline: false,
                    italic: false,
                    fontFamily: "Arial",
                    fontSize: 12,
                    bgColor: "lightgray",
                    textColor: "black",
                    halign: "left"
                }
                $(AllCols[j]).html('');
                $(AllCols[j]).css("font-weight", cell.bold ? "bolder" : "normal");
                $(AllCols[j]).css("font-style", cell.italic ? "italic" : "normal");
                $(AllCols[j]).css("text-decoration", cell.underline ? "underline" : "none");
                $(AllCols[j]).css("font-family", cell.fontFamily);
                $(AllCols[j]).css("font-size", cell.fontSize);
                $(AllCols[j]).css("color", cell.textColor);
                $(AllCols[j]).css("background-color", cell.bgColor);
                $(AllCols[j]).css("text-align", cell.halign);
                row.push(cell);

            }
        db.push(row);
        let cellArr = $("#grid .cell");
        $(cellArr[0]).trigger("click");
        }
    })
//saving the file
    $("#Save").on("click", async function () {
        let sdb = await dialog.showOpenDialog();
        let fp = sdb.filePaths[0];
        if (fp == undefined) {
            console.log("Please select file first");
            return;
        }
        let jsonData = JSON.stringify(db);
        fs.writeFileSync(fp, jsonData);
        // open dialogBox
        // select file
        // write 
        // Input=> file
    })
//opening new file
    $("#Open").on("click", async function () {
        let sdb = await dialog.showOpenDialog();
        let fp = sdb.filePaths[0];
        if (fp == undefined) {
            console.log("Please select file first");
            return;
        }
        let buffer = fs.readFileSync(fp);
        db = JSON.parse(buffer);
        let AllRows = $("#grid").find(".row");
        for (let i = 0; i < AllRows.length; i++) {
            let AllCols = $(AllRows[i]).find(".cell");
            for (let j = 0; j < AllCols.length; j++) {
                //    DB
                $(`#grid .cell[r-id=${i}][c-id=${j}]`).html(db[i][j].value);
            }
        }
    })
//******************************************************************************************************************* */
//-----------------------****************FUNCTIONS IN THE FILE(fORMULA HANDELING)--------------------------------------------------------------------------------
//*************************************************************************** ******************************************/
    $("#grid .cell").on("blur", function(){
        let { colId, rowId } = getrc(this);
        let cellObject = getcell(this);
        lsc = this;
        if (cellObject.value == $(this).html()) {
            return;
        }

        if (cellObject.formula) {
            rmusnds(cellObject, this);
        }

        cellObject.value = $(this).text();
        updateCell(rowId, colId, cellObject.value);
        // console.log(db);
        
    })
    $("#formula-input").on("blur", function(){
        let cellObj = getcell(lsc);
        if (cellObj.formula == $(this).val()) {
            return
        }
        let { colId, rowId } = getrc(lsc);
        if (cellObj.formula) {
            // delete Formula
            rmusnds(cellObj,lsc);
        }
        cellObj.formula = $(this).val();
        // add Formula
        setusnds(lsc, cellObj.formula);
        // calculate your value
        let nVal = evaluate(cellObj);
        updateCell(rowId, colId, nVal);
        // console.log(db);

    })

    function setusnds(cellELem, formula){
        // (A1 + B1)
        formula = formula.replace("(", "").replace(")", "");
        // "A1 + B1"
        let formulaComponent = formula.split(" ");
        // [A1,+,B1]
        for (let i = 0; i < formulaComponent.length; i++) {
            let charAt0 = formulaComponent[i].charCodeAt(0);
            if (charAt0 > 64 && charAt0 < 91) {
                let { r, c } = getParentRowCol(formulaComponent[i]);
                let parentCell = db[r][c];

                let { colId, rowId } = getrc(cellELem);
                let cellObject = getcell(cellELem)
                // add yourself to donwstream of your parent
                parentCell.downstream.push({
                    colId: colId, rowId: rowId
                });
                cellObject.upstream.push({
                    colId: c,
                    rowId: r
                })

            }
        }
    }
    function rmusnds(cellObject, cellEllem) {
        cellObject.formula = "";
        let { rowId, colId } = getcell(cellEllem);
        for (let i = 0; i < cellObject.upstream.length; i++) {
            let uso = cellObject.upstream[i];
            let fuso = db[uso.rowId][uso.colId];
            // find index splice yourself
            let fArr = fuso.downstream.filter(function (dCell) {
                return !(dCell.colId == colId && dCell.rowId == rowId);
            })
            fuso.downstream = fArr;

        }
        cellObject.upstream = [];

    }
    function evaluate(cellObj){
        let formula = cellObj.formula;
        console.log(formula);
        for(let i=0;i < cellObj.upstream.length;i++){
            let cuso = cellObj.upstream[i];
            let colAddress = String.fromCharCode(cuso.colId + 65);
            let cellAddress = colAddress + (cuso.rowId+1);

            let fusokiVal = db[cuso.rowId][cuso.colId].value;
            // let formula = formula.replace(`/\b(${cellAddress})\b/`,fusokVal);
            let formulCompArr = formula.split(" ");
            formulCompArr = formulCompArr.map(function (elem) {
                if (elem == cellAddress) {
                    return fusokiVal;
                } else {
                    return elem;
                }
            })
            formula = formulCompArr.join(" ");
        }

        console.log(formula);
        // infix evaluation
        return eval(formula);
    }
    
    function updateCell(rowId, colId, nVal) {
        let cellObject = db[rowId][colId];
        cellObject.value = nVal;
        // update ui 


        $(`#grid .cell[r-id=${rowId}][c-id=${colId}]`).html(nVal);

        for (let i = 0; i < cellObject.downstream.length; i++) {
            let dsocordObj = cellObject.downstream[i];
            let dso = db[dsocordObj.rowId][dsocordObj.colId];
            let dsonVal = evaluate(dso);
            updateCell(dsocordObj.rowId, dsocordObj.colId, dsonVal);
        }

    }
            


    function init(){
        $("#File").trigger("click");
        $("#New").trigger("click");
  
        // console.log(db)
    
    }
    init();

    function getParentRowCol(cellName) {
        let charAt = cellName.charCodeAt(0);
        let sArr = cellName.split("");
        // [A,4,0]
        sArr.shift();
        // [4,0]
        let sRow = sArr.join("");
        // [4,0]=>"40"
        let r = Number(sRow) - 1;
        let c = charAt - 65;
        return { r, c };
    }

    // Get cell from db
    function getcell(cellElem) {
        let { colId, rowId } = getrc(cellElem);
        return db[rowId][colId];
    }


    function getrc(elem){
        let colId = Number($(elem).attr("c-id"));
        let rowId = Number($(elem).attr("r-id"));
        return{
            colId,rowId
        }

    }

})

