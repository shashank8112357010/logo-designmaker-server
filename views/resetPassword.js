

module.exports.resetPasswordScreen = (resetToken, workEmail) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Password</title>
            <style>
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
                    color: #fff;
                }
                .content {
                    padding: 20px 0;
                    text-align: center;
                }
                .content input {
                    display: block;
                    margin: 10px auto;
                    padding: 10px;
                    width: 70%;
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
                    <h2>Protect your account with a unique password, at least 8 characters long.</h2>
                    <form action="http://localhost:4000/api/dashboard/resetPassword/${resetToken}" method="POST">
                        <input type="hidden" name="resetToken" value="${resetToken}" />
                        <input type="email" name="workEmail" value="${workEmail}" readonly />
                        <input type="password" name="newPassword" placeholder="Enter new password" required />
                        <input type="password" name="confirmPassword" placeholder="Re-enter your password to confirm" required />
                        <div>
                            <button type="submit">Save</button>
                            <button type="button" onclick="window.location.href='/'">Cancel</button>
                        </div>
                    </form>
                </div>
                <div class="footer">
                    <p>Footer &copy; 2024</p>
                </div>
            </div>
        </body>
        </html>
    `;
};
