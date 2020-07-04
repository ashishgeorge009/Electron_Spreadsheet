const $ = require("jquery");

$(document).ready(function(){
    let db;
    $("#grid .cell").on("click", function(){
        let {colId , rowId} = getrc(this);
        let value = String.fromCharCode(65+colId)+(rowId+1);
        $("#address-input").val(value);
    })

    $("#grid .cell").on("blur", function(){
        let {colId , rowId} = getrc(this);
        db[rowId][colId].value = $(this).text();
        // console.log(db);
    })
    function init(){
        db =[];
        let AllRows = $("#grid").find(".row");
        for(let i=0;i<AllRows.length;i++){
            let AllCols = $(AllRows[i]).find(".cell");
            let row =[];
            for(let j=0; j<AllCols.length;j++){
                let cell = {
                    value :"",
                    formula:""
                }
                row.push(cell);

            }
        db.push(row);
        }
        // console.log(db)
    
    }
    init();

    function getrc(cell){
        let colId = Number($(cell).attr("c-id"));
        let rowId = Number($(cell).attr("r-id"));
        return{
            colId,rowId
        }

    }

})

