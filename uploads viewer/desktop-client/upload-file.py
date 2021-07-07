from ftplib import FTP
import sys
import os

username = ''
password = ''
ftp_server_loc = ''
ftp_server_dir = ''

ftp = FTP(ftp_server_loc)
ftp.login(user=username, passwd=password)

filename = sys.argv[1].replace("\\", "/")

confirmation = input("Confirm upload of file \"" + filename + "\" (y/n) ? ")

if (confirmation == "y"):

    ftp.cwd(ftp_server_dir)
    os.chdir(os.path.dirname(filename))
    with open(os.path.basename(filename), 'rb') as fp:
        ftp.storbinary('STOR ' + os.path.basename(filename), fp)

    print("Successfully uploaded " + filename + "!")

    ftp.quit()