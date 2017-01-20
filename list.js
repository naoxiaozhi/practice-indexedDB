$(function(){
	//创建一个indexedDB，各浏览器支持
	var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
	var student_table = "Student";//一个objectstorage 类似一个数据库中的表
	var eventFuns = {
		creatIndexedDB: function(data_table){
			var request = indexedDB.open("StudentDB")
			request.onsuccess = function(){
				console.log("~~~success~~~");
			};
			request.onerror = function(event){
				console.log("~~~fail~~~:"+event.target.errorCode);
			};
			//修改数据库或对象存储的代码必须位于 upgradeneeded 事件处理函数中
			request.onupgradeneeded = function(e){
				console.log("onupgradeneeded running~");
				var datadb = e.target.result;
				if (!datadb.objectStoreNames.contains(student_table)) {
					// datadb.deleteObjectStore(student_table);
					console.log("I need creat objectStore!");
					var objectStore = datadb.createObjectStore(student_table, { keyPath: "number" }); 
					objectStore.createIndex("number", "number", { unique: true });
					// objectStore.createIndex("ssn", "ssn", { unique: true });
					for (var i in data_table) {      
						objectStore.add(data_table[i]);   
					} 
					console.log("objectStore:"+objectStore);
				};
			}
		},
		get_data: function(){
			var request = indexedDB.open("StudentDB"); //IDBRequest
			var db;
			var trans,store;
			request.onsuccess=function(e){
				console.log("打开StudentDB数据库成功！");
				db = request.result; //IDBDataBase:存储数据库实例对象
				trans = db.transaction(["Student"], "readwrite");  //打开数据库成功的时候 创建事务对象
		  		store = trans.objectStore("Student");  //IDBObjectStore 从事务中获取对象存储区
		  		store.openCursor().onsuccess=function(e){
		  			console.log("游标创建成功~");
					var r=e.target.result;
					if(!r){return;}
					console.log(r.value.number);
		  			var str_all="<tr>"+
							"<td>"+r.value.number+"</td>"+
							"<td>"+r.value.name+"</td>"+
							"<td>"+r.value.sex+"</td>"+
							"<td>"+r.value.age+"</td>"+
							"<td>"+"<a href='javascript:void(0)' class='del'>删除</a>"+"</td>"
							"<tr>";
					$("#list").append(str_all);
					r.continue();
				}
				store.openCursor().onerror=function(){
					console.log("游标创建失败~");
				}
				console.log(db.name+":"+store);
			};
			request.onerror=function(){
				console.log("打开StudentDB数据库失败！");
			};
		},
		Add: function(number,name,sex,age){
			var request = indexedDB.open("StudentDB"); //IDBRequest
			var db;
			request.onsuccess = function(){
				db = request.result; //IDBDataBase:存储数据库实例对象
				var trans = db.transaction(["Student"], "readwrite");  
			  	var store = trans.objectStore("Student");  //IDBObjectStore
				store.put({"number":number,"name":name,"age":age,"sex":sex});
			}
		},
		Del: function(key){
			console.log("开始删除对象！");
			var request,db,trans;
			request=indexedDB.open("StudentDB");//数据库（indexedDB）的名字
			request.onsuccess=function(e){
				console.log("删除函数中数据库打开成功！");
				db=request.result;
				trans=db.transaction(["Student"],"readwrite");
				trans.objectStore("Student").delete(key);
				console.log("删除对象成功！");
			};
			request.onerror=function(e){
				console.log("错误："+e.target.errorCode);
			};
		},
		Serach: function(key){
			console.log("开始搜索记录！");
			console.log("key:"+key);
			var request,db,trans;
			request=indexedDB.open("StudentDB");//数据库（indexedDB）的名字
			request.onsuccess=function(e){
				console.log("搜索函数中数据库打开成功！");
				db=request.result;
				trans=db.transaction(["Student"],"readwrite");
				var serachResult = trans.objectStore("Student").get(key);
				serachResult.onsuccess = function(data){
					data = serachResult.result;
					var str_all="<tr id='tr_first'><th>学号</th><th>姓名</th><th>性别</th><th>年龄</th><th>操作</th></tr>"+"<tr>"+
							"<td>"+data.number+"</td>"+
							"<td>"+data.name+"</td>"+
							"<td>"+data.sex+"</td>"+
							"<td>"+data.age+"</td>"+
							"<td>"+"<a href='javascript:void(0)' class='del'>删除</a>"+"</td>"
							"<tr>";
					$("#list").html(str_all);
				}
				console.log("搜索记录成功！");
				console.log(serachResult);
			};
			request.onerror=function(e){
				console.log("错误："+e.target.errorCode);
			};
		}
	};
	var init=(function(){
		eventFuns.creatIndexedDB(data_table);	
		eventFuns.get_data();
	})();
	$("#add").on("click",function(){	
		var sex=$("input[name=sex]:checked").attr("data");
		var str="<tr>"+
				"<td>"+$("#number").val()+"</td>"+
				"<td>"+$("#name").val()+"</td>"+
				"<td>"+sex+"</td>"+
				"<td>"+$("#age").val()+"</td>"+
				"<td>"+"<a href='javascript:void(0)' class='del'>删除</a>"+"</td>"
				"<tr>";
		console.log("add start!");
		eventFuns.Add($("#number").val(),$("#name").val(),sex,$("#age").val());
		$("#list tr:eq(1)").before(str);
	});
	$("#serach").on("click",function(){
		eventFuns.Serach($("#number").val());
	});
	$(".del").die().live("click",function(){
		$(this).closest("tr").remove();
		console.log($(this).closest("tr").find("td:first").text());
		eventFuns.Del($(this).closest("tr").find("td:first").text());
	});
	$(".del-db").on("click",function(){
			// indexedDB.deleteDatabase('TestDB1');
			// indexedDB.deleteDatabase('myDB');
			// indexedDB.deleteDatabase('TestDB');
	});
})