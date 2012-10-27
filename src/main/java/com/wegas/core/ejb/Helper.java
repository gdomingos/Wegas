/*
 * Wegas.
 *
 * http://www.albasim.com/wegas/  *
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem
 *
 * Copyright (C) 2012
 */
package com.wegas.core.ejb;

import java.util.List;
import java.util.StringTokenizer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author fx
 */
public class Helper {

    private static final Logger logger = LoggerFactory.getLogger(Helper.class);

    /**
     *
     * @param <T>
     * @param context
     * @param type
     * @param service
     * @return
     * @throws NamingException
     */
    public static <T> T lookupBy(Context context, Class<T> type, Class service) throws NamingException {
        try {
            //   context.
            return (T) context.lookup("java:module/" + service.getSimpleName() + "!" + type.getName());
        }
        catch (NamingException ex) {
            try {
                return (T) context.lookup("java:global/classes/" + service.getSimpleName() + "!" + type.getName());
            }
            catch (NamingException ex1) {
                try {
                    return (T) context.lookup("java:global/cobertura/" + service.getSimpleName() + "!" + type.getName());
                }
                catch (NamingException ex2) {
                    logger.error("Uanble to retrieve to do jndi lookup on class: {}", type.getSimpleName());
                    throw ex2;
                }
            }
        }
    }

    /**
     *
     * @param <T>
     * @param type
     * @param service
     * @return
     * @throws NamingException
     */
    public static <T> T lookupBy(Class<T> type, Class service) throws NamingException {
        return lookupBy(new InitialContext(), type, service);
    }

    /**
     *
     * @param <T>
     * @param type
     * @return
     * @throws NamingException
     */
    public static <T> T lookupBy(Class<T> type) throws NamingException {
        return lookupBy(type, type);
    }

    public static String encodeVariableName(String name) {
        Pattern pattern = Pattern.compile("[^\\w]|(^\\d)");                     //Search for special chars or initial digit

        StringBuilder sb = new StringBuilder();
        StringTokenizer st = new StringTokenizer(name);
        String tmp;
        Boolean first = true;
        while (st.hasMoreTokens()) {                                            //CamelCase the name except first word (instance like)
            tmp = st.nextToken();
            if (first) {
                sb.append(tmp.substring(0, 1).toLowerCase());
                first = false;
            } else {
                sb.append(tmp.substring(0, 1).toUpperCase());
            }
            sb.append(tmp.substring(1));
            //sb.append(tmp.substring(1).toLowerCase());

        }
        Matcher matcher = pattern.matcher(sb.toString());
        return matcher.replaceAll("_$1");                                    //Replace special chars and initial digit with "_"
    }

    /**
     * Build an instance like Name, adding "_#" at the end if the name is
     * unavailable
     *
     * @param name The initial String the output should look like
     * @param unavailableNames The name should not be in this List
     * @return a new name, unique.
     */
    public static String buildUniqueName(String name, List<String> unavailableNames) {

        String newName = Helper.encodeVariableName(name);

        Pattern pattern = Pattern.compile("^(\\w+)_(\\d+)$");                   //Build a unique name, adding _# at the end
        Matcher matcher = pattern.matcher(newName);
        Integer nb = 1;
        String tmp;
        if (matcher.find()) {
            tmp = matcher.group(1);
        } else {
            tmp = newName;
        }
        while (unavailableNames.contains(newName)) {
            newName = tmp + "_" + nb;
            nb = nb + 1;
        }
        return newName;
    }
}
