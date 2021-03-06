<template>
  <v-row
    fill-height
    align-start
    justify="space-between"
    dense
    no-gutters
    class="d-flex flex-column"
  >
    <v-col cols="12" class="pa-0 flex-shrink-1">
      <!-- <v-sheet height="10vh"> -->
      <v-toolbar height="40" flat color="background" extended>
        <v-toolbar-title
          class="title primary--text font-weight-bold d-flex align-center pb-0"
          >IMAGES</v-toolbar-title
        >
        <v-spacer></v-spacer>
        <v-menu bottom>
          <template v-slot:activator="{ on: menu }">
            <v-tooltip top>
              <template v-slot:activator="{ on: tooltip }">
                <v-btn icon v-on="{ ...tooltip, ...menu }">
                  <v-icon color="primary">
                    {{ viewData[view].icon }}
                  </v-icon>
                </v-btn>
              </template>
              <span>VIEW</span>
            </v-tooltip>
          </template>
          <v-list>
            <v-list-item
              v-for="viewItem in Object.values(viewData)"
              :key="viewItem.value"
              @click="view = viewItem.value"
            >
              <v-tooltip left>
                <template v-slot:activator="{ on }">
                  <v-icon
                    :color="viewItem.value === view ? 'primary' : 'disabled'"
                    v-on="on"
                    >{{ viewItem.icon }}</v-icon
                  >
                </template>
                <span>{{ viewItem.text }}</span>
              </v-tooltip>
            </v-list-item>
          </v-list>
        </v-menu>
        <btnWithTooltip
          :btnClass="['mx-4']"
          :btnProps="{ icon: true, color: 'primary' }"
          :iconProps="{ icon: 'mdi-image-plus' }"
          :tooltipProps="{ disabled: false, top: true }"
          :tooltipText="'Add Image'"
          @click="newImage()"
        ></btnWithTooltip>
      </v-toolbar>
    </v-col>
    <v-col cols="12" class="pa-0 flex-grow-1">
      <component
        :is="view"
        :view="view"
        :images="images || []"
        @imageClicked="onImageClicked"
        @showPreview="onShowPreview"
        :style="styleContentHeight"
      ></component>
    </v-col>
    <!--
  move these dialogs to single, dynamic
    -->
    <v-dialog
      v-model="modalVisible"
      transition="dialog-transition"
      :key="'m' + modalVisible"
      max-width="800"
    >
      <component
        :is="modalComp"
        v-bind="modalCompData"
        @closeModal="modalVisible = false"
        @imageAdded="onImageAdded"
        @imageClicked="onImageClicked"
        @imageDeleted="onImageDeleted"
        @imageEditSaved="onImageEditSaved"
      ></component>
    </v-dialog>

    <!-- MODAL IMAGE PREVIEW -->
    <v-dialog
      :value="modalImageFullPreview"
      :key="'ip' + modalImageFullPreview"
      height="unset"
      width="unset"
      transition="dialog-transition"
      class="imagePreviewDialog"
      @input="$store.dispatch('toggleModalImageFullPreview')"
    >
      <imagePreviewModal></imagePreviewModal>
    </v-dialog>
  </v-row>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import imageEdit from '@/components/images/imageEdit'
import btnWithTooltip from '@/components/global/buttons/btnWithTooltip'

export default {
  components: {
    btnWithTooltip,
    imageEdit,
    imagePreviewModal: () => import('@/components/images/imagePreviewModal'),
    imageUplaod: () => import('@/components/images/imageUpload'),
    detailed: () => import('@/components/images/imagesDetailed'),
    list: () => import('@/components/images/imagesList'),
    tiles: () => import('@/components/images/imagesTiles')
  },
  data: () => ({
    images: [],
    modalComp: null,
    modalCompData: null,
    modalVisible: false,
    search: null,
    view: 'tiles',
    viewData: {
      list: {
        disabled: true,
        icon: 'mdi-format-list-bulleted-square',
        text: 'LIST',
        value: 'list'
      },
      detailed: {
        disabled: true,
        icon: 'mdi-card-bulleted-outline',
        text: 'DETAILED',
        value: 'detailed'
      },

      tiles: {
        icon: 'mdi-view-comfy',
        text: 'TILED',
        value: 'tiles'
      }
    }
  }),
  computed: {
    ...mapGetters(['styleContentHeight']),
    ...mapState({
      modalImageFullPreview: state => state.modalImageFullPreview
    })
  },
  methods: {
    getDefaultImage() {
      const setting = this.$store.state.settings.find(
        s => s.name === 'Default_Image'
      )
      return this.images.find(i => i.id === setting.setting)
    },
    getImages() {
      //console.log('get images')
      this.$store
        .dispatch('apiCall', { endpoint: '/images_get_all' })
        .then(resp => {
          this.images = resp
          //console.log('images received')
        })
        .catch(err => {
          console.log('err:', err)
        })
    },
    newImage() {
      this.modalComp = 'imageUplaod'
      this.modalVisible = true
    },
    onImageAdded(image) {
      console.log(image)
      this.images.push(image)
      this.modalVisible = false
    },
    onImageClicked(image) {
      this.modalComp = 'imageEdit'
      this.modalCompData = {
        defaultImage: this.getDefaultImage(),
        imageData: image
      }
      this.modalVisible = true
    },
    onImageDeleted(image) {
      this.images = this.images.filter(i => i.id !== image.id)
      this.modalVisible = false
    },
    onShowPreview(image) {
      this.$store.dispatch('setStateValue', {
        key: 'imagePreviewData',
        value: image
      })
      this.$store.dispatch('toggleModalImageFullPreview')
    },
    onImageEditSaved(image) {
      this.updateImage(image)
    },
    updateImage(image) {
      //TODO:ageData, display_name: this.imageRename })
      //Will images be moved to state? prob not but keep for now
      const key = this.images.findIndex(i => i.id === image.id)
      if (key > -1) {
        this.$set(this.images, key, image)
      }
      this.$set(this.modalCompData, 'imageData', image)
    }
  },
  created() {
    this.view = localStorage.getItem('lastViewImages')
      ? localStorage.getItem('lastViewImages')
      : 'tiles'
  },
  async mounted() {
    this.loading = true
    await this.getImages()
    this.loading = false
  }
}
</script>

<style scoped></style>
