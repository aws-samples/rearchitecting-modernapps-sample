FROM public.ecr.aws/docker/library/gradle:7.5.1-jdk17 as builder
COPY ./ /home/gradle/
RUN gradle --no-daemon war tomcatLibs

FROM public.ecr.aws/docker/library/tomcat:10.1.11-jre17
COPY --from=builder /home/gradle/build/libs/docrdr.war $CATALINA_HOME/webapps/ROOT.war
COPY --from=builder /home/gradle/build/libs/*.jar $CATALINA_HOME/lib/
COPY ./conf/redisson.yaml $CATALINA_HOME/redisson.yaml
