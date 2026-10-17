include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-homebox
PKG_VERSION:=1.2
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

# Select the precompiled HomeBox binary for the target architecture.
# ARCH is the target architecture (e.g. aarch64 or x86_64).
ifeq ($(ARCH),aarch64)
  HOMEBOX_BIN:=./bin/homebox-linux-arm64-musl
else ifeq ($(ARCH),x86_64)
  HOMEBOX_BIN:=./bin/homebox-linux-amd64-musl
else
  HOMEBOX_BIN:=
endif

define Package/homebox
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=HomeBox local network speed test
endef

define Package/homebox/description
  HomeBox local network speed test binary.
endef

define Package/luci-app-homebox
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=LuCI support for HomeBox
  DEPENDS:=+homebox +luci-base +rpcd
endef

define Package/luci-app-homebox/description
  LuCI support for HomeBox local network speed test.
endef

define Build/Compile
endef

define Package/homebox/install
	@test -n "$(HOMEBOX_BIN)" || { echo "Unsupported HomeBox target architecture: $(ARCH)" >&2; exit 1; }
	@test -f "$(HOMEBOX_BIN)" || { echo "HomeBox binary not found: $(HOMEBOX_BIN)" >&2; exit 1; }
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(HOMEBOX_BIN) $(1)/usr/bin/homebox
endef

define Package/luci-app-homebox/install
	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/homebox
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d
	$(INSTALL_DIR) $(1)/usr/share/luci/i18n
	$(INSTALL_DATA) ./htdocs/luci-static/resources/view/homebox/homebox.js $(1)/www/luci-static/resources/view/homebox/homebox.js
	$(INSTALL_DATA) ./root/etc/config/homebox $(1)/etc/config/homebox
	$(INSTALL_BIN) ./root/etc/init.d/homebox $(1)/etc/init.d/homebox
	$(INSTALL_DATA) ./root/usr/share/rpcd/acl.d/luci-app-homebox.json $(1)/usr/share/rpcd/acl.d/luci-app-homebox.json
	$(INSTALL_DATA) ./root/usr/share/luci/menu.d/luci-app-homebox.json $(1)/usr/share/luci/menu.d/luci-app-homebox.json
	$(INSTALL_DATA) ./po/zh_Hans/homebox.po $(1)/usr/share/luci/i18n/homebox.zh-cn.lmo
endef

$(eval $(call BuildPackage,homebox))
$(eval $(call BuildPackage,luci-app-homebox))
