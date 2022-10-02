<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar"/>

    <breadcrumb class="breadcrumb-container"/>

    <div class="right-menu">
      <el-dropdown class="avatar-container"
                   @visible-change="visibleChange"
                   trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatarUrl" class="user-avatar">
          <i :class="['el-icon-caret-bottom',dropDownVisible && 'reverse']"/>
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/">
            <el-dropdown-item>
              首页
            </el-dropdown-item>
          </router-link>
          <a target="_blank" href="https://github.com/faylai/vue-admin">
            <el-dropdown-item>Github</el-dropdown-item>
          </a>
          <a target="_blank" href="https://panjiachen.github.io/vue-element-admin-site/#/">
            <el-dropdown-item>文档</el-dropdown-item>
          </a>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import avatarPicture from '@/assets/person.png'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  data() {
    return {
      dropDownVisible: false
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar'
    ]),
    avatarUrl() {
      if (this.avatar) {
        return this.avatar
      } else {
        return avatarPicture
      }
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    logout() {
      this.$store.dispatch('user/logout').then(() => {
        this.$router.push(`/login?redirect=${this.$route.fullPath}`)
      })
    },
    visibleChange(visible) {
      this.dropDownVisible = visible
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, .08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 38px;
          height: 38px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 50%;
          margin-top: -8px;
          height: 16px;
          font-size: 16px;
          color: #808288;

          &.reverse {
            transform: rotateZ(180deg);
          }
        }
      }

      :hover {
        .el-icon-caret-bottom {
          color: #409EFF;

        }
      }
    }
  }
}
</style>
