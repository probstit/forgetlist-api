const mailTemplate = (url: string, text: string, buttonText: string) =>
  `
<html>
  <head>
   <link href="https://fonts.googleapis.com/css?family=Montserrat|Pacifico&display=swap" rel="stylesheet">
  </head>
  <body>
    <div style="
      background-color: #234789;
      font-family: Montserrat, Verdana, Tahoma, sans-serif;
      text-align: center;
      width: 100%;
      height: 200px;
      padding: 10px;
      color: #fbf5f3;
    ">
      <h1 style="
        font-family: Pacifico";
        margin-top: 140px;
        >Shopery</h1>
      <h3 style="color: #fbf5f3; margin-top: 50px;">${text}</h1>
      <div style="
        background-color: #fbf5f3;
        font-family: Montserrat, Verdana, Tahoma, sans-serif;
        margin: 10px auto;
        border-style: none;
        border: none;
        display: block;
        font-weight: bold;
        width: 80px;
        height: 25px;
        border-radius: 20px;
        padding: 2px;
      "><a href="${url}" style="color: #234789; text-decoration: none; font-size: 13px;">${buttonText}</a></div>
    </div>
  </body>
</html>`;

export default mailTemplate;
