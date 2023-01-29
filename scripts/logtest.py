from log import Log, LogType
class test():
    def __init__(self):
        a = Log()
        a.log_message(LogType.DEBUG, "*********")
a = test()
