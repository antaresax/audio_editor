




;(function (window, Constructor, undefined) { 

	// Constructor
	var BizOrder = function(){
		    that = this;
		
		
	};


	BizOrder.prototype = {
		init : function() {
                
	           var jasonNewoderOn=false;//1440 비즈 주문하기 설정 20170125
				that.preset.tiger();  //함수
				
				
				
				
				
				
				
				
				
	var canvas_biz = {
					
				   
					
					
					
			testpage: function() {
						 
						 
						 
						 
				
						

					  }
	
            ,neworderProcess : function(work_mode_data) {   // 보관함 저장 , 주문하기 새로운 주문

                                  
                  							  
			    //console.log(BZ.FIRSTJSON);  초기 로드시 받은 JSON정보를 
				//console.log(BZ.PHOTOJSONDATA);  업로드된 사진 정보들 받는다.
		
			

					}
					
					
					
					
			,saveProcess : function() {

										  
													  



							}
										
		   ,ordercomplete: function(objuserid, objmakedpdfurl, objordernumber, objcomposefile, objcode, objsize, objcolor) { 
					
							  
							   }
							
							
										
			 ,local_test : function() {
								 
								  var arr = JSON.parse( window.localStorage.getItem('tempSaveJson'));// 로컬에서 데이터 불러오기
								  
								  var arr_string =  window.localStorage.getItem('tempSaveJson');// 로컬에서 데이터 불러오기
					 
					
							
							  }
							  
										
			,change_asp_id: function() { 
							   
					
						 }


			};    // canvas_biz 끝 

				Constructor.canvas_biz = canvas_biz;

					// new 주문하기
						$('#new_order_set').on({
							click : function() {
								 
								canvas_biz.neworderProcess();
								
							}
						});
							
                       
				        	$('#aa_layout').on({
							click : function() {
								 
								canvas_biz.testpage();
								
							}
						});   
			
			

	
 }
		,preset :{
			
				tiger :function(){
					
					console.log("order");
					
				}
		
			
		}
		,mainload :{
			
				load :function(){
					

					
				}
		
			
		}
		
		,managermode :{
			
				load :function(){
					

					
				 } // 매니저 모드 로드
				
				
	          ,skinResist : function(){   // 보관함 저장 , 주문하기 새로운 주문

                                  
                  							  
			 
							
							//basketFormData.append("OrderFlag", "F");        //
					
		
			

					     }
					
		       ,modify :function(){  //관리자 수정모드
					
			
								
		
				         }
					
					
					
		
			
		}//manager mmode 끝
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
	}; // bizorder 끝
	
	
	
	
	
	
				$('#goRegist').on({
					click : function() {
				
                      
						that.managermode.skinResist("I");  
	             //PM.Editor.Framework.ManageSetCutData(1); 
				 
				 
				 
				 			PM.Front._canvas.alert('등록이 완료되었습니다.', function(){
											
											BZ.UNLOAD =false;

										         //top.window.open('about:blank','_self').close(); 
												 
												 
												 // top.window.opener=self;
												 // self.opener = self; 
												 // self.opener = null;
												 // top.self.close(); 
												 
												 
                                        //  window.open('about:blank','_self').self.close();
										
										window.opener='self';
										window.open('','_parent','');
										window.close();
																				

										} );
					
					}
				});
				
				//goModify
				
				$('#goSkin').on({
					click : function() {
						
						
						
						
						if(asp_InsertMode =="U"){  //관리자모드  수정모드
							that.managermode.modify();  // JSON 파일을 불러와서 수정한다.
								
							$("#goManager").hide();
							$("#goSkinSave").show();
							$("#goRegist").hide();
							
							}
						if(asp_InsertMode =="I"){  // 관리자모드 편집 신규모드
							
							$("#goManager").click();
							$("#goSkinSave").hide();
							
				
						}
		
                    BZ.MANAGEMODE =true		
                    PM.Editor.Framework.SaveProduct();	 				
	             PM.Editor.Framework.ManageSetCutData(1); 
				 
				 
				
					
					}
				});
				
				
				$('#goSkinSave').on({
					click : function() { 
				
             that.managermode.skinResist("U");  
				 
				  
				 			PM.Front._canvas.alert('등록이 완료되었습니다.', function(){
											
											BZ.UNLOAD =false;

										         //top.window.open('about:blank','_self').close(); 
												 
												 
												 // top.window.opener=self;
												 // self.opener = self; 
												 // self.opener = null;
												 // top.self.close(); 
												 
												 
                                        //  window.open('about:blank','_self').self.close();
										
										window.opener='self';
										window.open('','_parent','');
										window.close();
																				

										} );
				
					
					}
				});
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				

	Constructor.Biz = BizOrder;
	
	
	  BizOrder();

})(window, BizPrint);
	
var Biz_data = new BizPrint.Biz() // 객체필요
Biz_data.__proto__.init(); //초기 로드해야함
//BizPrint.canvas_biz.delPage(); 

BizPrint.canvas_biz.change_asp_id();
	 
//BizPrint.canvas_biz.local_test();  로컬에서 데이터 불러오기 

//BizPrint.canvas_biz.neworderProcess();

//Biz_data.__proto__.mainload.load(); 

setTimeout(function() {
	
if(asp_mode=="admin"){
	
	
	
	
	Biz_data.__proto__.managermode.load(); 
	
  
	
setTimeout(function() { 


	$('#goSkin').click();// 관리자 모드 호출하기..

						
					}, 500); 
	
}
	
else{	
	
Biz_data.__proto__.mainload.load(); 
PM.Editor.Framework.SetCutData(1);


}

var myVar = setInterval(function(){ PM.Editor.Framework.SaveProduct();}, 500);

setTimeout(function() {


 clearInterval(myVar);

						
					}, 8000);


						
					}, 500);






