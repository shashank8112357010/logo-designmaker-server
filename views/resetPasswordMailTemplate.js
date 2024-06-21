

module.exports.resetPasswordTemplate = (username, resetLink) => {
    return `
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Password</title>
            <style>
                /* Global CSS styles */
                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                }
                .container {
                    margin: 0 auto;
                    max-width: 600px;
                    padding: 20px;
                    background: #f9f9f9;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background: #4b2179;
                    color: #fff;
                    text-align: center;
                    padding: 10px 0;
                    border-top-left-radius: 5px;
                    border-top-right-radius: 5px;
                }
                .header h1 {
                    margin: 0;
                }
                .content {
                    padding: 20px 0;
                    text-align: center;
                }
                .content img {

                    margin-bottom: 20px;
                }
                .footer {
                    background: #4b2179;
                    color: #fff;
                    text-align: center;
                    padding: 10px 0;
                    border-bottom-left-radius: 5px;
                    border-bottom-right-radius: 5px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Reset Your Password</h1>
                </div>
                <div class="content">
                    <h2>Hello, ${username}
                    </h2>
                    <p>Here is the link to reset your password: </p>

                    <button><a href="${resetLink}" style="background: #4b2179; color: #fff; padding: 10px 20px; text-decoration: none;
                        border-radius: 5px;">Reset Password</a></button>
                    <!-- <p>
                        <%= message %>
                    </p> -->
                    <p>
                        If you did not ask to reset your password, you may ignore this message.. 
                    </p>
                    <p>
                        
                    </p>
                </div>
                <div class="footer">
                    <p>Footer &copy; 2024</p>
                </div>
            </div>
        </body>
        </html>

    `
}