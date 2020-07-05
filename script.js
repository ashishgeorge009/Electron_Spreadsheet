const $ = require("jquery");

$(document).ready(function(){
    let db;
    let lsc;
    $("#grid .cell").on("click", function(){
        let {colId , rowId} = getrc(this);
        let value = String.fromCharCode(65+colId)+(rowId+1);
        $("#address-input").val(value);
    })

    $("#grid .cell").on("blur", function(){
        let { colId, rowId } = getrc(this);
        let cellObject = getcell(this);
        
        if (cellObject.value == $(this).html()) {
            lsc=this;
            return
        }

        if (cellObject.formula) {
            rmusnds(cellObject, this);
        }

        cellObject.value = $(this).text();
        updateCell(rowId, colId, cellObject.value);
        // console.log(db);
        lsc = this;
    })
    $("#formula-input").on("blur", function(){
        let cellObj = getcell(lsc);
        console.log(cellObj);
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
        // updateCell(rowId, colId, nval);
        console.log(db);

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
                return dCell.colId != colId && dCell.rowId != rowId;
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
            let cellAddress = colAddress + (cuso.colId+1);

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
            


    function init(){
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
        }
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
        console.log(colId);
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

