package com.literalice.docrdr;

import java.io.*;

import org.h2.tools.RunScript;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.annotation.WebListener;

// It doesn't need in production env
@WebListener
public class DbStarter extends org.h2.server.web.JakartaDbStarter {

    @Override
    public void contextInitialized(ServletContextEvent event) {
        ServletContext servletContext = event.getServletContext();
        
        servletContext.setInitParameter("db.url", "jdbc:h2:mem:test");

        super.contextInitialized(event);

        try {
            String[] scripts = "/data/init.sql".split(",");
            for (String sclipt : scripts) {
                RunScript.execute(getConnection(), new FileReader(new File(getClass().getResource(sclipt).toURI())));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
