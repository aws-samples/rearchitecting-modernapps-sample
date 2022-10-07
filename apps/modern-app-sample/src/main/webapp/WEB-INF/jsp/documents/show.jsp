<%@ page contentType="text/html; charset=utf-8" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<% pageContext.setAttribute("newLineChar", "\n"); %>
<!DOCTYPE html>
<html>

<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta charset="utf-8">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
  <title>Document Reader</title>
</head>

<body>
  <div class="container">
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href='<%= request.getContextPath() + "/" %>'>Home</a></li>
        <li class="breadcrumb-item"><a href='<%= request.getContextPath() + "/documents" %>'>Document List</a></li>
        <li class="breadcrumb-item active" aria-current="page">Document</li>
      </ol>
    </nav>
    <div class="card">
      <div class="card-body">
        <h2 class="card-title">${document.translatedTitle}</h2>
        <h3 class="card-subtitle mb-2 text-muted"><a href="${documentURL}">${document.url}</a></h3>
        <p class="card-text">
          ${ fn:replace(document.translatedContent, newLineChar, '<br />') }
        </p>
        <a href='<%= request.getContextPath() + "/documents" %>' class="btn btn-primary btn-lg" role="button">Document
          List</a>
      </div>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
    crossorigin="anonymous"></script>
</body>

</html>