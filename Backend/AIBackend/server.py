from flask import Flask,redirect,url_for
app=Flask(__name__)

@app.route('/')
def hello_world_ai():
    return "HELLO AI TEAM "

if __name__=="__main__":
    app.run(debug=True)


