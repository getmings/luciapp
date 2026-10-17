include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-homebox
PKG_VERSION:=1.3
PKG_RELEASE:=1

# 编译 .po -> .lmo 需要 luci-base 的 host 工具 po2lmo
PKG_BUILD_DEPENDS:=luci-base/host

include $(INCLUDE_DIR)/package.mk

# 根据目标架构选择预编译的 HomeBox 二进制（放在本包 bin/ 目录下）
ifeq ($(ARCH),aarch64)
  HOMEBOX_BIN:=$(CURDIR)/bin/homebox-linux-arm64-musl
else ifeq ($(ARCH),x86_64)
  HOMEBOX_BIN:=$(CURDIR)/bin/homebox-linux-amd64-musl
else
  HOMEBOX_BIN:=
endif

define Package/luci-app-homebox
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=LuCI support for HomeBox (with bundled binary)
  DEPENDS:=+luci-base +rpcd
  PKGARCH:=$(if $(HOMEBOX_BIN),$(ARCH),all)
endef

define Package/luci-app-homebox/description
  LuCI support for HomeBox local network speed test.
  The precompiled homebox binary is bundled in this package.
endef

define Package/luci-app-homebox/conffiles
/etc/config/homebox
endef

define Build/Prepare
	$(INSTALL_DIR) $(PKG_BUILD_DIR)
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/luci-app-homebox/install
	@test -n "$(HOMEBOX_BIN)" || { echo "Unsupported HomeBox target architecture: $(ARCH)" >&2; exit 1; }
	@test -f "$(HOMEBOX_BIN)" || { echo "HomeBox binary not found: $(HOMEBOX_BIN)" >&2; exit 1; }

	# homebox 二进制
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(HOMEBOX_BIN) $(1)/usr/bin/homebox

	# LuCI 前端
	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/homebox
	$(INSTALL_DATA) $(CURDIR)/htdocs/luci-static/resources/view/homebox/homebox.js \
		$(1)/www/luci-static/resources/view/homebox/homebox.js

	# 配置 / 服务脚本
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_DATA) $(CURDIR)/root/etc/config/homebox $(1)/etc/config/homebox
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) $(CURDIR)/root/etc/init.d/homebox $(1)/etc/init.d/homebox

	# rpcd 后端（获取二进制版本）+ ACL + 菜单
	$(INSTALL_DIR) $(1)/usr/libexec/rpcd
	$(INSTALL_BIN) $(CURDIR)/root/usr/libexec/rpcd/luci.homebox $(1)/usr/libexec/rpcd/luci.homebox
	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DATA) $(CURDIR)/root/usr/share/rpcd/acl.d/luci-app-homebox.json \
		$(1)/usr/share/rpcd/acl.d/luci-app-homebox.json
	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d
	$(INSTALL_DATA) $(CURDIR)/root/usr/share/luci/menu.d/luci-app-homebox.json \
		$(1)/usr/share/luci/menu.d/luci-app-homebox.json

	# 翻译：.po 必须经 po2lmo 转换，不能直接改名
	$(INSTALL_DIR) $(1)/usr/share/luci/i18n
	@if [ -x "$(STAGING_DIR_HOSTPKG)/bin/po2lmo" ]; then \
		$(STAGING_DIR_HOSTPKG)/bin/po2lmo $(CURDIR)/po/zh_Hans/homebox.po \
			$(1)/usr/share/luci/i18n/homebox.zh-cn.lmo; \
	else \
		echo "po2lmo not found, skip i18n" >&2; \
	fi
endef

# 安装后让 rpcd 加载新的 ACL / 后端脚本，并清理 LuCI 缓存
define Package/luci-app-homebox/postinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	rm -f /tmp/luci-indexcache /tmp/luci-indexcache.* 2>/dev/null
	rm -rf /tmp/luci-modulecache 2>/dev/null
	/etc/init.d/rpcd reload >/dev/null 2>&1
}
exit 0
endef

$(eval $(call BuildPackage,luci-app-homebox))
