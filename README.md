# imageupload
picture preview,compress and upload
# description
Imageupload reqeust by ajax.This project use servlet to handle request.<br/>
Imageupload support picture preview,preview size,compression,compression type(size or quality)<br/>
Because it use html5 api,so it not support IE11-
# use
Import image.css and image.upload.js
```html
<link type="text/css" rel="stylesheet" href="css/image.css"/>
<script type="text/javascript" src="js/image.upload.js"></script>
```
Define a structure of html as below:
```html
<div id="container"></div>
<form id="upload_form">
  ...
  <div class="imageuploader-container">
	  <span class="select-btn">select picture</span>
	  <input type="file" id="select"/>
  </div>
  ...
  <input type="submit" value="upload"/>
</form>
```
You must provide a form and a submit button,div#container is picture container.<br/>
Then use below js
```html
<script type="text/javascript">
    var imageUpload = new ImageUpload("upload_form", {
      container: "container",  //id display picture container
      selectId: "select",  //file used to select the picture box id
      accept: "image/*",  //type of image
      previewSize: {width:150, height:150},  //picture preview size. default: 150x150
      //before upload call
      beforeUpload: function(){
        if(!imageUpload.imageSelected){  //determine whether to choose a picture
          alert("picture is not selected");
          return false;  //prevent send Ajax
        }
      },
      //after response call
      success: function(data){
        var result = JSON.parse(data);
        console.log(result);
      },
      //after upload failure call
      failure: function(){
        alert("upload failure");
      }
    });

</script>
```
For more use. See this project
