import logging
from enum import Enum
import os
import pathlib
from datetime import datetime

class LogType(Enum):
    CRITICAL= 'CRITICAL'
    ERROR= 'ERROR'
    WARNING= 'WARNING'
    INFO= 'INFO'
    DEBUG=  'DEBUG'

class Log():

    def __init__(self):
        self.ScriptDirPath = pathlib.Path().resolve()
        self.setup_logger(self.ScriptDirPath)
        print ("neco")

    def log_message(self, logType:LogType, msg:str):
        if(logType == LogType.DEBUG):
            logging.debug(msg)
        elif(logType == LogType.INFO):
            logging.info(msg)
        elif(logType == LogType.WARNING):
            logging.warning(msg)
        elif(logType == LogType.ERROR):
            logging.error(msg)
        elif(logType == LogType.CRITICAL):
            logging.critical(msg)
        else:
            raise ValueError(f"logType argument has to be one of LogType enum {LogType._member_names_}")

    def setup_logger(self, whereToStore):
        now = datetime.now()
        logsPath = os.path.join(whereToStore, 'logs')
        if not os.path.exists(logsPath):
            os.makedirs(logsPath)
#        current_time = now.strftime("%Y_%m_%d-%H_%M_%S-")
#        scriptName = os.path.basename(__file__).replace('.py','')
        logName = 'log.log'
        logNamePath = os.path.join(whereToStore, 'logs', logName)
        logging.basicConfig(filename=logNamePath, level=logging.DEBUG,
                        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

#a = log()
