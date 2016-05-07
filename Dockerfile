FROM centos:centos7
MAINTAINER jd

#VOLUME /data
COPY build/epel.repo /etc/yum.repos.d/
COPY build/node-v4.4.0-linux-x64.tar.xz /opt/
COPY build/RPM-GPG-KEY-EPEL-7 /etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-7
ENV PATH /opt/node/bin:$PATH
RUN yum -y update && \
    yum -y install git gcc gcc-c++ make automake && \
    yum clean all && \
    cd /opt && \
    tar xf node-v4.4.0-linux-x64.tar.xz && \
    ln -s node-v4.4.0-linux-x64 node && \
    git clone https://github.com/majeinfo/extws.git ./extws/ && \
    cd /opt/extws && npm install && \
    systemctl disable nodejs
COPY config/local.prod.js /opt/extws/config/local.js
COPY config/mailer.prod.js /opt/extws/config/mailer.js

EXPOSE 3001
WORKDIR /opt/extws
CMD [ "npm", "start" ]
#CMD [ "/bin/bash" ]

