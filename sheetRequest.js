function testData(){
  var request = {
    get:{
    name: "シート1",
    renge:[1,1,3,3],  
    action: "getValue"
  },
    sheet:{action:'info'}
  };
  Logger.log(request.asak);
  Logger.log(requestIsObject(request.get));
  Logger.log(requestHandler(request));
}

function requestHandler(request){
  
  var respons = {};
  
  Object.keys(request).forEach(function(key){
  
  switch( true ) {
    case key == 'getValue' && requestIsObject(request[key]):
      
      respons.getValue = getSpreadsheetRange(request[key],getValueRequest);
      
      break;

    case key == 'query' && requestIsObject(request[key]):
      
      respons.query = queryRequest(request[key]);
      
      break;

    case key == 'setValue' && requestIsObject(request[key]):
      
      respons.setValue = getSpreadsheetRange(request[key],setValueRequest);
      
      break;

    case key == 'append' && requestIsObject(request[key]):
      
      respons.append = appendRowRequest(request[key]);;
      
      break;

    case key == 'insert' && requestIsObject(request[key]):
      
      respons.append = insertRowRequest(request[key]);;
      
      break;

    case key == 'delete' && requestIsObject(request[key]):
      
      respons.append = deleteRowRequest(request[key]);;
      
      break;

    case key == 'setVal' && requestIsObject(request[key]):
      
      respons.delete ={};
      
      break;
      
    case key == 'insertVal' && requestIsObject(request[key]):
      
      respons.delete ={};
      
      break;
      
    case key == 'sheet' && requestIsObject(request[key]):
      
      respons.sheet = sheetsRequestHandler(request[key]);
      
      break;
      
    case key == 'request' && requestIsObject(request[key]):
      
      respons.respons = requestHandler(request[key]);
      
      break;

  }
    
  });
  
  return respons;
  
}

//request function

function getValueRequest(renge,obj,arr){
  
  if(arr[2] == 1 && arr[3] == 1){
    
    return renge.getValue();
    
  }
  
  return renge.getValues();

}

function queryRequest(obj){
  
  var sheet = setSheet("sql_temp");
  
  sheet.hideSheet();
  
  sheet.clear();
  
  sheet.getRange(1,1).setFormula(obj.query); //"=query('シート1'!G1:Z10," + '"select G where G is not null")
  
  obj.name = "sql_temp";
  
  return getSpreadsheetRange(obj,getValueRequest);

}

function insertRowRequet(obj){
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  sheet.getSheetByName(obj.name).insertRows(parceRange(sheet,obj.rowIndex), obj.numRows ? obj.numRows : obj.value.length);
  
}

function deleteRowRequet(obj){
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  sheet.getSheetByName(obj.name).deleteRows(parceRange(sheet,obj.rowIndex),obj.numRows ? obj.numRows : obj.value.length);
  
}

function appendRowRequest(obj){
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  sheet.getSheetByName(obj.name).appendRow(obj.rowContents || obj.value);
  
  return sheet.getLastRow();
  
}

function setValRequest(obj,insert){
  
  obj.renge = obj.renge || [];
  
  obj.renge[0] = obj.renge[0] ? obj.renge[0] : "lastRow";
  
  obj.renge[1] = obj.renge[1] ? obj.renge[1] : 1;
  
  obj.renge[2] = obj.renge[2] ? obj.renge[2] : obj.value.length;
  
  obj.renge[3] = obj.renge[3] ? obj.renge[3] : obj[0].value.length;
  
  
  return getSpreadsheetRange(obj,insert ? insertValRequest : setValueRequest);
  
}

function insertValRequest(renge,obj,arr){
  
  var insert = {
    
    name:obj.name,
    
    rowIndex:arr[0],
    
    numRows:obj.value.length
    
  }
  
  insertRowRequet(insert);
  
  return setValueRequest(renge,obj,arr);
  
}

function setValueRequest(renge,obj,arr){
  
  if(arr[2] == 1 && arr[3] == 1){
    
    return renge.setValue();
    
  }
  
  return renge.setValues();

}


function sheetsRequestHandler(request){
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var respons = {};
  
  Object.keys(request).forEach(function(key){
  
  switch( true ) {
    case key == 'insert' && requestIsObject(request[key]):
              
      var name = request.name || 1;
      
      var sheet = setSheet(request.name);
      
      respons.insert = sheet.getIndex();
        
        break;

    case key == 'delete' && requestIsObject(request[key]):
      
      var sheet = ss.getSheetByName(request.name);
      
      ss.deleteSheet(sheet);
      
      respons.delete = request.name;
        
        break;

    case key == 'info' && requestIsObject(request[key]):
      
      var sheets = ss.getSheets();
      
      var arr = [];
      
      for (i = 0; i < sheets.length; i++) {
         
        arr[i] = [];
         
        arr[i].push(sheets[i].getName());
         
        arr[i].push(sheets[i].getIndex());
         
        arr[i].push(sheets[i].getLastRow());
         
        arr[i].push(sheets[i].getLastColumn());
         
        if(sheets[i].getLastColumn()>0){
             
          var heder = sheets[i].getRange(1,1,1,sheets[i].getLastColumn()).getValues();
             
          arr[i].push(heder[0]);
             
        }
      }
      
      respons.info = arr;
      
      break;
  }
    
  });
  
  return respons;
  
 }

//helper

function getSpreadsheetRange(obj,collback){
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(obj.name);
  
  var arr = splitStringArray(obj.renge);
  
  for(var i=0;i<arr.length;i++){
    
    var val = parceRange(sheet,val);
    
    if(!isFinite(val) || val <= 0){
      
      val = i < 3 ? 1 : sheet.getLastRow();
      
    }
    
    val = i == 3 ? val - arr[0] : val;
    
    val = i == 4 ? val - arr[1] : val;
    
    arr[i] = val;
    
  }
  
  var renge = sheet.getRange(arr[0],arr[1],arr[2],arr[3]);
  
  return collback(renge,obj,arr);

}

function parceRange(sheet,val){
  
  if((typeof val == "string" || val instanceof String) && isValidJson(val)){
        
    val = JSON.parse(val);
    
  }
  
  if((typeof val == "string" || val instanceof String) && val.match(/lastRow/)){
    
    val = safeEval(val.replace('lastRow',sheet.getLastRow()));
    
  }
  if((typeof val == "string" || val instanceof String) && val.match(/lastColumn/)){
      
    val = safeEval(val.replace('lastColumn',sheet.getLastColumn()));
  }
  if(val instanceof Object){
    
    var obj = val;
    
    var arr = sheet.getRange(1,val.col,sheet.getLastRow(),1).getValues();
    
    if(val.revers){
    
      for(var i=arr.length-1;i>=0;i--){
        
        if(arr[i][0] === obj.value){
        
          val = i+1;
            
        }
      }
        
      val = arr.length;
    
    }else{
    
      for(var i=0;i<arr.length;i++){
        
        if(arr[i][0] === obj.value){
      
          val = i+1;
            
        }
      }
      val = 1;
    }
    
    if(obj.add){
      
      val = val + obj.add;
      
    }
  }
  
}

function requestIsObject(obj){
  
  return obj !== null && Object.prototype.toString.call(obj) == "[object Object]";
  
}

function isValidJson(value) {
  
  try {
    
    JSON.parse(value)
    
  } catch (e) {
    
    return false
    
  }
  
  return true
}

function setSheet(name){
  
  var sheet = SpreadsheetApp.getActive().getSheetByName(name);
  
  if(sheet)
    
    return sheet
    
  sheet=SpreadsheetApp.getActiveSpreadsheet().insertSheet();
  
  sheet.setName(name);
  
  return sheet;
  
}


function safeEval(val){
  
    return Function('"use strict";return ('+val+')')();
  
}

function splitStringArray(val, name) {
  
  var arr;
  
  if ((typeof val == "string" || val instanceof String) && val.match(/,/)) {
    
    arr = val.split(",");
    
  } else if (typeof val == "string" || val instanceof String) {
    
    arr = [val];
    
  } else if (val instanceof Array) {
    
    arr = val;
    
  } else {
    
    arr = [];
    
  }
  
  if (name) {
    
    return arr.filter(function(a) {
      
      return a !== name;
      
    });
    
  } else {
    
    return arr;
    
  }
}