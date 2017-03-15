package com.mcx.servlet;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

public class ImageServlet extends HttpServlet{
	private static final long serialVersionUID = 1L;
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		System.out.println("content-type：" + req.getContentType());
		
		resp.setContentType("text/html;charset=utf-8");
		//resp.setHeader("Access-Control-Allow-Origin", "*");
		PrintWriter pw = resp.getWriter();
		DiskFileItemFactory diskFileItemFactory = new DiskFileItemFactory();
		boolean isMultipart = ServletFileUpload.isMultipartContent(req);
		if(isMultipart){
			ServletFileUpload servletFileUpload = new ServletFileUpload(diskFileItemFactory);
			try {
				List<FileItem> fileItems = servletFileUpload.parseRequest(req);
				for(int i = 0; i< fileItems.size(); i++){
					FileItem item = fileItems.get(i);
					if(!item.isFormField()){
						String directory = req.getServletContext().getRealPath("upload");
						String fileName = String.valueOf(System.currentTimeMillis());
						item.write(new File(directory + "/" + fileName + ".png"));
						System.out.println("name=" + item.getFieldName());
					}else{
						System.out.println("name=" + item.getFieldName() + ",value=" + item.getString("utf-8"));
					}
				}
				pw.print("{\"result\":\"1\",\"message\":\"success\"}");
			} catch (Exception e) {
				e.printStackTrace();
				pw.print("{\"result\":\"0\",\"message\":\"failure\"}");
			}
		}else{
			pw.print("{\"result\":\"0\",\"message\":\"failure\"}");
		}
		pw.close();
	}
}
