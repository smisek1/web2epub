import logging
from enum import Enum
import os
import pathlib

class LogType(Enum):
    CRITICAL= 'CRITICAL'
    ERROR= 'ERROR'
    WARNING= 'WARNING'
    INFO= 'INFO'
    DEBUG=  'DEBUG'

class log():

    def __init__(self):
        self.ScriptDirPath = pathlib.Path().resolve()
        self.setup_logger(self.RootDirPath)

    def log_message(self, logType:LogType, msg:str):
        if(logType == LogType.DEBUG):
            logging.debug(self.ConfData['ContainerName']+': '+ msg)
        elif(logType == LogType.INFO):
            logging.info(self.ConfData['ContainerName']+': '+ msg)
        elif(logType == LogType.WARNING):
            logging.warning(self.ConfData['ContainerName']+': '+ msg)
        elif(logType == LogType.ERROR):
            logging.error(self.ConfData['ContainerName']+': '+ msg)
        elif(logType == LogType.CRITICAL):
            logging.critical(self.ConfData['ContainerName']+': '+ msg)
        else:
            raise ValueError(f"logType argument has to be one of LogType enum {LogType._member_names_}")

    def setup_logger(self, whereToStore):
        now = datetime.now()
        logsPath = os.path.join(whereToStore, 'logs')
        if not os.path.exists(logsPath):
            os.makedirs(logsPath)
        current_time = now.strftime("%Y_%m_%d-%H_%M_%S-")
        scriptName = os.path.basename(__file__).replace('.py','')
        logName = current_time + scriptName + '.log'
        logNamePath = os.path.join(whereToStore, 'logs', logName)
        logging.basicConfig(filename=logNamePath, level=logging.DEBUG,
                        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

a = log()
