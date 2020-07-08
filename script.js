const $ = require("jquery");
const fs = require("fs");
const dialog = require("electron").remote.dialog;

$(document).ready(function(){
    let db;
    let lsc;
    $("#grid .cell").on("click", function(){
        let {colId , rowId} = getrc(this);
        let cellObj = getcell(this);
        let value = String.fromCharCode(65+colId)+(rowId+1);
        $("#address-input").val(value);
        $("#formula-input").val(cellObj.formula);
    })
//new file
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
                    upstream: []
                }
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
                let { r, c } = getParentRowCol(formulaComponent[i], charAt0);
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
        $("#New").trigger("click");
  
        // console.log(db)
    
    }
    init();

    function getParentRowCol(cellName, charAt0) {
        let sArr = cellName.split("");
        // [A,4,0]
        sArr.shift();
        // [4,0]
        let sRow = sArr.join("");
        // [4,0]=>"40"
        let r = Number(sRow) - 1;
        let c = charAt0 - 65;
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

