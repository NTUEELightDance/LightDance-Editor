FROM cturra/ntp
RUN apk add tzdata
RUN cp /usr/share/zoneinfo/Asia/Taipei /etc/localtime
RUN echo "Asia/Taipei" /etc/timezone
RUN date