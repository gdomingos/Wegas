package com.wegas.admin.jsf.controllers;

import com.wegas.core.persistence.users.UserEntity;
import com.wegas.admin.jsf.util.JsfUtil;
import com.wegas.admin.jsf.util.PaginationHelper;
import com.wegas.core.ejb.UserEntityFacade;

import java.io.Serializable;
import java.util.ResourceBundle;
import javax.ejb.EJB;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.SessionScoped;
import javax.faces.component.UIComponent;
import javax.faces.context.FacesContext;
import javax.faces.convert.Converter;
import javax.faces.convert.FacesConverter;
import javax.faces.model.DataModel;
import javax.faces.model.ListDataModel;
import javax.faces.model.SelectItem;

/**
 * 
 * @author fx
 */
@ManagedBean(name = "userEntityController")
@SessionScoped
public class UserEntityController implements Serializable {

    private UserEntity current;
    private DataModel items = null;
    @EJB
    private com.wegas.core.ejb.UserEntityFacade ejbFacade;
    private PaginationHelper pagination;
    private int selectedItemIndex;

    /**
     * 
     */
    public UserEntityController() {
    }

    /**
     * 
     * @return
     */
    public UserEntity getSelected() {
        if (current == null) {
            current = new UserEntity();
            selectedItemIndex = -1;
        }
        return current;
    }

    private UserEntityFacade getFacade() {
        return ejbFacade;
    }

    /**
     * 
     * @return
     */
    public PaginationHelper getPagination() {
        if (pagination == null) {
            pagination = new PaginationHelper(10) {

                @Override
                public int getItemsCount() {
                    return getFacade().count();
                }

                @Override
                public DataModel createPageDataModel() {
                    return new ListDataModel(getFacade().findRange(new int[]{getPageFirstItem(), getPageFirstItem() + getPageSize()}));
                }
            };
        }
        return pagination;
    }

    /**
     * 
     * @return
     */
    public String prepareList() {
        recreateModel();
        return "List";
    }

    /**
     * 
     * @return
     */
    public String prepareView() {
        current = (UserEntity) getItems().getRowData();
        selectedItemIndex = pagination.getPageFirstItem() + getItems().getRowIndex();
        return "View";
    }

    /**
     * 
     * @return
     */
    public String prepareCreate() {
        current = new UserEntity();
        selectedItemIndex = -1;
        return "Create";
    }

    /**
     * 
     * @return
     */
    public String create() {
        try {
            getFacade().create(current);
            JsfUtil.addSuccessMessage(ResourceBundle.getBundle("/wegas-admin-bundle").getString("UserEntityCreated"));
            return prepareCreate();
        } catch (Exception e) {
            JsfUtil.addErrorMessage(e, ResourceBundle.getBundle("/wegas-admin-bundle").getString("PersistenceErrorOccured"));
            return null;
        }
    }

    /**
     * 
     * @return
     */
    public String prepareEdit() {
        current = (UserEntity) getItems().getRowData();
        selectedItemIndex = pagination.getPageFirstItem() + getItems().getRowIndex();
        return "Edit";
    }

    /**
     * 
     * @return
     */
    public String update() {
        try {
            getFacade().edit(current);
            JsfUtil.addSuccessMessage(ResourceBundle.getBundle("/wegas-admin-bundle").getString("UserEntityUpdated"));
            return "View";
        } catch (Exception e) {
            JsfUtil.addErrorMessage(e, ResourceBundle.getBundle("/wegas-admin-bundle").getString("PersistenceErrorOccured"));
            return null;
        }
    }

    /**
     * 
     * @return
     */
    public String destroy() {
        current = (UserEntity) getItems().getRowData();
        selectedItemIndex = pagination.getPageFirstItem() + getItems().getRowIndex();
        performDestroy();
        recreatePagination();
        recreateModel();
        return "List";
    }

    /**
     * 
     * @return
     */
    public String destroyAndView() {
        performDestroy();
        recreateModel();
        updateCurrentItem();
        if (selectedItemIndex >= 0) {
            return "View";
        } else {
            // all items were removed - go back to list
            recreateModel();
            return "List";
        }
    }

    private void performDestroy() {
        try {
            getFacade().remove(current);
            JsfUtil.addSuccessMessage(ResourceBundle.getBundle("/wegas-admin-bundle").getString("UserEntityDeleted"));
        } catch (Exception e) {
            JsfUtil.addErrorMessage(e, ResourceBundle.getBundle("/wegas-admin-bundle").getString("PersistenceErrorOccured"));
        }
    }

    private void updateCurrentItem() {
        int count = getFacade().count();
        if (selectedItemIndex >= count) {
            // selected index cannot be bigger than number of items:
            selectedItemIndex = count - 1;
            // go to previous page if last page disappeared:
            if (pagination.getPageFirstItem() >= count) {
                pagination.previousPage();
            }
        }
        if (selectedItemIndex >= 0) {
            current = getFacade().findRange(new int[]{selectedItemIndex, selectedItemIndex + 1}).get(0);
        }
    }

    /**
     * 
     * @return
     */
    public DataModel getItems() {
        if (items == null) {
            items = getPagination().createPageDataModel();
        }
        return items;
    }

    private void recreateModel() {
        items = null;
    }

    private void recreatePagination() {
        pagination = null;
    }

    /**
     * 
     * @return
     */
    public String next() {
        getPagination().nextPage();
        recreateModel();
        return "List";
    }

    /**
     * 
     * @return
     */
    public String previous() {
        getPagination().previousPage();
        recreateModel();
        return "List";
    }

    /**
     * 
     * @return
     */
    public SelectItem[] getItemsAvailableSelectMany() {
        return JsfUtil.getSelectItems(ejbFacade.findAll(), false);
    }

    /**
     * 
     * @return
     */
    public SelectItem[] getItemsAvailableSelectOne() {
        return JsfUtil.getSelectItems(ejbFacade.findAll(), true);
    }

    /**
     * 
     */
    @FacesConverter(forClass = UserEntity.class)
    public static class UserEntityControllerConverter implements Converter {

        /**
         * 
         * @param facesContext
         * @param component
         * @param value
         * @return
         */
        public Object getAsObject(FacesContext facesContext, UIComponent component, String value) {
            if (value == null || value.length() == 0) {
                return null;
            }
            UserEntityController controller = (UserEntityController) facesContext.getApplication().getELResolver().
                    getValue(facesContext.getELContext(), null, "userEntityController");
            return controller.ejbFacade.find(getKey(value));
        }

        java.lang.Long getKey(String value) {
            java.lang.Long key;
            key = Long.valueOf(value);
            return key;
        }

        String getStringKey(java.lang.Long value) {
            StringBuffer sb = new StringBuffer();
            sb.append(value);
            return sb.toString();
        }

        /**
         * 
         * @param facesContext
         * @param component
         * @param object
         * @return
         */
        public String getAsString(FacesContext facesContext, UIComponent component, Object object) {
            if (object == null) {
                return null;
            }
            if (object instanceof UserEntity) {
                UserEntity o = (UserEntity) object;
                return getStringKey(o.getId());
            } else {
                throw new IllegalArgumentException("object " + object + " is of type " + object.getClass().getName() + "; expected type: " + UserEntityController.class.getName());
            }
        }
    }
}