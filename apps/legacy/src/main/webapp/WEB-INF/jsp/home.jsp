<%@ page contentType="text/html; charset=utf-8" %>
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
    <h1>Document Reader</h1>
    <form action='<%= request.getContextPath() + "/documents/drafts" %>' method="post">
      <div class="mb-3">
        <label for="document-url" class="form-label">URL</label>
        <input type="url" class="form-control" id="document-url" name="document-url"
          placeholder="https://example.com">
      </div>
      <div class="mb-3">
        <button type="submit" class="btn btn-primary mb-3">Confirm</button>
      </div>
      <div class="mb-3">
        <h2>Example</h2>
        <ul>
          <li>https://aws.amazon.com/jp/blogs/containers/actuate-uses-aws-fargate-for-ml-based-real-time-video-monitoring-and-threat-detection/</li>
          <li>https://aws.amazon.com/jp/blogs/containers/cryptographic-signing-for-containers/</li>
        </ul>
      </div>
    </form>
    <a href='<%= request.getContextPath() + "/documents" %>'>Document List</a>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
    crossorigin="anonymous"></script>
</body>

</html>