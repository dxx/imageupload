(function(window){
	function ImageUpload(el, options){
		this.form = typeof el == "string" ? document.getElementById(el) : el;
		this.options = {
			container: "",
			selectId: "",
			accpet: "",
			previewSize: {width:150, height:150},
			resize: false,
			resizeType: "size",  //size or quality
			size: {width:150, height:150},
			quality: 1,
			multipart: false,
			multipartCount: 9,
			beforeUpload: function(){return true},
			success: function(data){},
			failure: function(){}
		};
		/**
		 * iamges container
		 * constructor: {id:id, name:name, blob:blob}
		 * id: image object id
		 * name: image object name
		 * blob: image data
		 */
		this.imageArray = new Array();
		this.imageSelected = false;
		
		for(var key in options){
			this.options[key] = options[key];
		}
		
		var container = this.options.container;
		var fileInput = document.getElementById(this.options.selectId);
		if(this.options.accept){
			fileInput.accept = this.options.accept;
		}
		
		var _imageUpload = iUpload = this;
		var handleObj = {
			fileInput: fileInput,
			previewSize: _imageUpload.options.previewSize,
			resize: _imageUpload.options.resize,
			resizeType: _imageUpload.options.resizeType,
			size: _imageUpload.options.size,
			quality: _imageUpload.options.quality,
			imageArray: _imageUpload.imageArray
		}
		var imageReg = /png|jpg|jpeg|gif/i;
		fileInput.onchange = function(){
			
			if(this.value){
				//judge the maximum count of picture
				if(_imageUpload.options.multipart == true 
					&& _imageUpload.imageArray.length >= _imageUpload.options.multipartCount){
					alert("maximum can only choose " + _imageUpload.options.multipartCount + " pictures");
				}else{
					var suffix = this.value.substring(this.value.lastIndexOf(".") + 1, this.value.length);
					if(imageReg.test(suffix)){
						
						//create id
						var imageId = "upload_image";
						if(_imageUpload.options.multipart){
							var imgs = document.getElementsByClassName("upload-image");
							imageId = "upload_image" + (imgs.length + 1);
						}
						
						previewImage(handleObj, container, imageId, function(id, name, blob){
							
							var imageObj = {id:id, name:name, blob:blob};
							if(!_imageUpload.options.multipart){
								//if is not multipart, push one obj in the array
								_imageUpload.imageArray.splice(0, 1);
							}
							_imageUpload.imageArray.push(imageObj);
							
							_imageUpload.imageSelected = true;
						});
					}else{
						alert("please choose picture");
					}
				}
			}
		};
		
		this.form.onsubmit = this._ajaxForm.bind(this);
	}
	ImageUpload.prototype = {
		constructor: ImageUpload,
		_getXMLHttpRequest: function(){
			var xmlHttpRequest;
			try{
				// Firefox, Opera 8.0+, Safari
    			xmlHttpRequest=new XMLHttpRequest();
			}catch(e){
				try{
					// Internet Explorer
					xmlHttpRequest=new ActiveXObject("Msxml2.XMLHTTP");
				}catch(e){
					try{
						xmlHttpRequest=new ActiveXObject("Microsoft.XMLHTTP");
					}catch(e){
						throw new Error("你的浏览器过时了");
					}
				}
			}
			return xmlHttpRequest;
		},
		_ajaxForm: function(){
			var formData = new FormData();
			
			//set all of the input field
			var params = formSerialize(this.form);
			params.forEach(function(str, i){
				var strs = str.split("=");
				formData.append(strs[0], strs[1]);
			})
			
			//set all of image
			this.imageArray.forEach(function(obj, i){
				formData.append(obj.name, obj.blob);
			});
			
			//get XMLHttpRequest object
			var xmlHttpRequest = this._getXMLHttpRequest();
			
			xmlHttpRequest.onreadystatechange = function(){
				if(xmlHttpRequest.readyState == 0){
				}else if(xmlHttpRequest.readyState == 1){  //before send
				}else if(xmlHttpRequest.readyState == 2){
				}else if(xmlHttpRequest.readyState == 3){
				}else if(xmlHttpRequest.readyState == 4){  //finish
					if(xmlHttpRequest.status == 200){
						this.options.success(xmlHttpRequest.responseText);
					}else{
						this.options.failure();
					}
				}
			}.bind(this);
			
			//open  asynchronous request
			xmlHttpRequest.open("POST", this.form.action, true);
			
			//if beforeUpload not retrun false, execute upload
			if(this.options.beforeUpload() == false){
			}else{
				//send formData
				xmlHttpRequest.send(formData);
			}
			
			//prevent form submit
			return false;
			
		}
	}
	/**
	 * preview image
	 * @param {Object} obj
	 *                 preview parameter
	 * fileInput：file dom object
	 * previewSize： the preview image size. it contains width and height two property
	 * resize: whether compression
	 * @param {Object} container
	 *                 Save picture container's id
	 * @param {Object} imageName
	 *                 image's id
	 * @param {Object} callback
	 *                 when image previewed, call the function
	 */
	function previewImage(obj, container, imageId, callback){
		var file = obj.fileInput.files[0];
		var fileReader = new FileReader();
		fileReader.onload = function(){
			var result = this.result;
			var img = document.createElement("img");
			//set the image id, name and class
			//img.id = imageId;
			//use file dom object's id as the img name
			img.name = obj.fileInput.id;
			img.className = "upload-image";
			//set the image size
			img.width = obj.previewSize.width;
			img.height = obj.previewSize.height;
			img.src = result;
			img.onload = function(){
				
				createView(imageId, container, img, obj.imageArray);
				
				var f = obj.fileInput;
				var suffix = f.value.substring(f.value.lastIndexOf(".") + 1);
				if(obj.resize){
					//compress the image
					var _blob = resize(img, suffix, obj);
					callback(imageId, img.name, _blob);
				}else{
					var _blob = base64ToBlob(result.split(",")[1], "image/" + suffix)
					callback(imageId, img.name, _blob);
				}
			}
		}
		fileReader.readAsDataURL(file);
	}
	/**
	 * compress image
	 * @param {Object} img 
	 * 				   the image to be compressed
	 * @param {Object} suffix
	 *                 image suffix
	 * @param {Object} obj
	 *                 compression parameter
	 * resizeType：compress type. size or quality
	 * size：compress size. it contains width and height two property
	 * quality：compress quality.0 ~ 1
	 */
	function resize(img, suffix, obj){
		var canvas = document.createElement("canvas");
		if(obj.resizeType == "size"){  //size compress
			canvas.width = obj.size.width;
			canvas.height = obj.size.height;
		}else if(obj.resizeType == "quality"){  //quality compress
			var w = img.naturalWidth * obj.quality;
			var h = img.naturalHeight * obj.quality;
			canvas.width = w;
			canvas.height = h;
		}
		var cxt = canvas.getContext("2d");
		cxt.drawImage(img, 0, 0, canvas.width, canvas.height);
		
		suffix = suffix.toLowerCase();
		suffix = suffix == "jpg" ? "jpeg" : suffix;
		//convert to base64
		var dataURL = canvas.toDataURL("image/" + suffix);
		return base64ToBlob(dataURL.split(",")[1], "image/" + suffix);
	}
	/**
	 * base64 to blob
	 * @param {Object} base64
	 *                 the base64 need to be converted
	 * @param {Object} type
	 */
	function base64ToBlob(base64, type){
		var data = window.atob(base64);
		var ua = new Uint8Array(data.length);
		for(var i = 0; i < data.length; i++){
			ua[i] = data.charCodeAt(i);
		}
		//create blob
		var blob = new Blob([ua], {type:type});
		return blob;
	}
	var iUpload;
	function createView(viewId, container, img, imageArray){
		var existView = document.getElementById(viewId);
		if(existView != null && existView.tagName == "DIV"){
			//if the img has already show in the html, remove it
			document.getElementById(container).removeChild(existView);
		}
		
		var view = document.createElement("div");
		view.id = viewId;
		view.className = "preview";
		view.style.width = img.width + "px";
		view.style.height = img.height + "px";
		var optView = document.createElement("div");
		optView.className = "preview-option";
		var delView = document.createElement("span");
		delView.className = "preview-delete";
		
		delView.addEventListener("click", function(){
			var id = this.parentNode.id;
			//remove this view
			document.getElementById(container).removeChild(this.parentNode);
			
			var find = false;
			//remove this image data
			for(var i = 0; i < imageArray.length; i++){
				if(find && i > 0){
					//rename id after the image by removed
					imageArray[i].id = "upload_image" + (i + 1);
					continue;
				}
				if(imageArray[i].id == id){
					imageArray.splice(i, 1);
					find = true;
					i--;
				}
			}
			
			//rename the view id
			var imgs = document.getElementsByClassName("upload-image");
			if(imgs.length == 0) iUpload.imageSelected = false;
			var arr = [];
			arr.push.apply(arr, imgs);
			arr.forEach(function(imgDom, i){
				imgDom.parentNode.id = "upload_image" + (i + 1);
			});
		});
		
		view.appendChild(img);
		view.appendChild(optView);
		view.appendChild(delView);
		
		//append view to the body
		document.getElementById(container).appendChild(view);
	}
	/**
	 * serialize form
	 * @param {Object} form
	 */
	function formSerialize(form){
		var elems = form.elements;
		var paramArray = new Array();
		for(var i = 0; i < elems.length; i++){
			var _input = elems[i];
			if(_input.type == "radio" || _input.type == "checkbox"){
				if(_input.checked){
					paramArray.push(_input.name + "=" + _input.value);
				}
			}else if(_input.type != "submit" && _input.type !="button" && _input.type != "file"){
					paramArray.push(_input.name + "=" + _input.value);	
			}
		}
		return paramArray;
	}
	
	window.ImageUpload = ImageUpload;
})(window);
