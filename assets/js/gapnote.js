(function(){
	$.mobile.GapNote = {
			dbName : 'GapNote',
			dbVersion : '1.0',
			dbDisplayName : 'Notas de GapNote',
			dbSize : 102400,
			dbConnection : null,
			dbIdentity : 1,
			init : function(){
				if(window['openDatabase']!==null){
					this.transaction(function(tx){						
					    tx.executeSql('CREATE TABLE IF NOT EXISTS GapNotes (id unique, titulo, descripcion, fecha, foto)');						
					    tx.executeSql('SELECT * FROM GapNotes',[], function(tx,rs){
					    	
							for(var i=0; i<rs.rows.length;i++){
								$.mobile.GapNote.populateNota(rs.rows.item(i));
							}
							
							$.mobile.GapNote.refreshNotas();
													
						}, $.mobile.GapNote.error);

					}, $.mobile.GapNote.error);					
					
				}else
					alert('Hemos detectado que no tienes soporte para Bases de datos, todas las notas que crees no se guardaran');
				
				$( '#nueva' ).live( 'pagebeforeshow',function(event, ui){
					$.mobile.GapNote.resetNota();
	
				});	
				
				
				$('#intro').live( 'pagebeforeshow',function(event, ui){						
					setTimeout(function(){
						$.mobile.changePage('#listado',{'transition':'fade'});
						},3000);
	
				});
				
				$('#camara').click(function(){
					$.mobile.GapNote.foto();
				});	
			},
			foto : function(){
				navigator.camera.getPicture(
					function (imageData) {
					    $('#foto').data('raw-data',imageData).css('background-image',"url(data:image/jpeg;base64," + imageData+")").fadeIn();
					},function (message) {
					    alert('Failed because: ' + message);
					}
					, { quality: 50,
					    destinationType: Camera.DestinationType.DATA_URL
				}); 
				
			},
			populateNota : function(nota){
				var notaId = nota.id;

				$('#items').append(
						$('<li>').append(
								$('<a/>').append(
									$('<h3>').text(nota.titulo)
								).append(
										$('<p>').text(nota.fecha)										
								).click(function(){
									$.mobile.GapNote.abrirNota(notaId);
								})								
						).append(
								$('<a/>').click(function(){
									var _p = $(this).parent();
									_p.fadeOut('slow',function(){
										_p.remove();	
									});
									
									$.mobile.GapNote.borrarNota(nota.id);
									
								})
						)
				);				
			},
			refreshNotas : function(){
				$('#items').listview('refresh');
			},
			nuevaNota : function(){
				$.mobile.GapNote.dbIdentity++;
				var nota = {
						id : $.mobile.GapNote.dbIdentity,
						titulo : $('#titulo').val(),
						fecha : $('#fecha').val(),
						descripcion : $('#descripcion').val(),
						foto : $('#foto').data('raw-data')
						
				};
				
				if(nota.titulo == ''){
					alert('El titulo es obligatorio');
					return;
				}
				
								
				this.transaction(function(tx){
					tx.executeSql('SELECT COUNT(*) as count FROM GapNotes',[],function(tx,rs){
						nota.id = rs.rows.item(0).count + 1;
						$.mobile.GapNote.insertarNota(nota);
					
					}, function(){
						nota.id = 1;
						$.mobile.GapNote.insertarNota(nota);	
					});
					
					
				
				}, $.mobile.GapNote.error);
				
								
				$.mobile.changePage('#listado');
			},
			insertarNota : function(nota){
				this.transaction(function(tx){
				    tx.executeSql('CREATE TABLE IF NOT EXISTS GapNotes (id unique, titulo, descripcion, fecha, foto)');					
					tx.executeSql('INSERT INTO GapNotes (id, titulo, descripcion, fecha, foto) VALUES (?,?,?,?,?)',[nota.id,nota.titulo, nota.descripcion, nota.fecha , nota.foto], function(tx,rs){						
						$.mobile.GapNote.populateNota(nota);
						$.mobile.GapNote.refreshNotas();

						},$.mobile.GapNote.error);
				},$.mobile.GapNote.error);
			},
			connect : function(){
				this.dbConnection = window.openDatabase(this.dbName, this.dbVersion, this.dbDisplayName, this.dbSize);				
			},
			transaction : function(fn){
				this.connect();
				this.dbConnection.transaction(fn);
			},
			resetNota : function(){
				$('#titulo,#descripcion').val('');
				$('#foto').hide();
				$('#fecha').val((new Date()).toLocaleString());					
			},
			abrirNota : function(id){		
				this.transaction(function(tx){
					tx.executeSql('SELECT * FROM GapNotes WHERE id = ?',[id], function(tx,rs){
						if(rs.rows.length>0){
							var visor = $('#ver');
							var nota = rs.rows.item(0);
							visor.find('.titulo').text(nota.titulo);
							visor.find('.fecha').text(nota.fecha);
							visor.find('.descripcion').text(nota.descripcion);
						    if(nota.foto!='undefined')
						    	visor.find('.foto')
						    		.data('raw-data',nota.foto)
						    		.css('background-image',"url(data:image/jpeg;base64," + nota.foto+")").fadeIn();
						    else visor.find('.foto').hide();

						    $.mobile.changePage('#ver',{'transition':'fade'});							
						}else  $.mobile.GapNote.error({'code':'El registro no existe'});						
					}, $.mobile.GapNote.error);

				}, $.mobile.GapNote.error);

				
				
			},
			borrarNota : function(id){
				this.transaction(function(tx){
					tx.executeSql('DELETE FROM GapNotes WHERE id=?',[id]);
				}, $.mobile.GapNote.error);									
			},
			error : function (err){
				alert('Error code : ' + err.code + ' msg:'+err.message);
			}
	};	

	$.mobile.GapNote.init();	

})();