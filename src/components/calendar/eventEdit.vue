<template>
  <v-card>
    <v-card-title
      v-text="`${id ? 'EDIT' : 'ADD NEW'} RESERVATION`"
      class="headline primary--text justify-center"
    ></v-card-title>
    <v-card-text style="max-width: 1000px; max-height: 600px;">
      <v-form ref="form" v-model="valid">
        <v-row align="center" justify="center">
          <v-col cols="8" class="pt-4 pb-0">
            <!--
              CATALOG ITEM MENU
            -->
            <v-autocomplete
              v-model="ciSelected"
              :items="orderBy(itemList, 'name', 1)"
              label="Catalog Item"
              item-text="name"
              item-value="name"
              item-disabled="isDisabled"
              outlined
              clearable
              prepend-icon="mdi-format-list-bulleted-type"
              return-object
              :filter="customFilter"
              :error-messages="formErrors.ciSelected"
            >
              <template v-slot:selection="data">
                <v-list-item>
                  <v-list-item-avatar size="45">
                    <img :src="data.item.image" />
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title
                      v-text="data.item.name"
                      class="font-weight-bold"
                    ></v-list-item-title>
                    <v-list-item-subtitle
                      class="text--primary"
                      v-text="
                        `${data.item.abbreviation}: ${data.item.category}`
                      "
                    ></v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-icon
                      v-text="statusData[ciSelectedStatus].icon"
                      :color="statusData[ciSelectedStatus].color"
                    ></v-icon>
                  </v-list-item-action>
                </v-list-item>
              </template>
              <template v-slot:item="data">
                <v-list-item-avatar size="45">
                  <img :src="data.item.image" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title
                    v-text="data.item.name"
                    class="font-weight-bold"
                  ></v-list-item-title>
                  <v-list-item-subtitle
                    :class="
                      data.item.isDisabled ? 'text--disabled' : 'text--primary'
                    "
                    v-text="`${data.item.abbreviation}: ${data.item.category}`"
                  ></v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-icon
                    v-text="statusData[data.item.status].icon"
                    :color="statusData[data.item.status].color"
                  ></v-icon>
                </v-list-item-action>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="8" class="text-xs-right py-0 mt-0">
            <!--
              PATRONMENU
            -->
            <v-autocomplete
              label="Patron"
              prepend-icon="mdi-account"
              v-model="patronSelected"
              outlined
              clearable
              :items="orderBy(patronList, 'last_name', 1)"
              item-text="last_name"
              item-value="id"
              return-object
              :filter="customFilter"
              :error-messages="formErrors.patronSelected"
              class="mt-4"
            >
              <template v-slot:append>
                <v-tooltip top v-if="!patronSelected">
                  <template v-slot:activator="{ on }">
                    <v-btn
                      text
                      icon
                      small
                      color="primary"
                      @click="modalPatronEdit = true"
                      v-on="on"
                    >
                      <v-icon color="primary">mdi-account-plus</v-icon>
                    </v-btn>
                  </template>
                  <span>Add New Patron</span>
                </v-tooltip>
              </template>
              <template v-slot:selection="data">
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title
                      v-text="`${data.item.last_name}, ${data.item.first_name}`"
                      class="font-weight-bold"
                    ></v-list-item-title>
                    <v-list-item-subtitle
                      class="text--primary"
                      v-text="`Barcode`"
                    ></v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </template>
              <template v-slot:item="data">
                <v-list-item-content>
                  <v-list-item-title
                    v-text="`${data.item.last_name}, ${data.item.first_name}`"
                    class="font-weight-bold"
                  ></v-list-item-title>
                  <v-list-item-subtitle
                    class="text--primary"
                    v-text="data.item.barcode"
                  ></v-list-item-subtitle>
                </v-list-item-content>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="5">
            <!--
              START DATE ++ TIME
            -->
            <v-dialog
              ref="startDateDialog"
              v-model="modalStartDate"
              :return-value.sync="startDate"
              persistent
              width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="startDate"
                  label="Start Date"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-on="on"
                  :error-messages="formErrors.startDate"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="startDate"
                scrollable
                :allowed-dates="allowedStart"
              >
                <v-spacer></v-spacer>
                <v-btn text color="primary" @click="modalStartDate = false"
                  >Cancel</v-btn
                >
                <v-btn
                  text
                  color="primary"
                  @click="$refs.startDateDialog.save(startDate)"
                  >OK</v-btn
                >
              </v-date-picker>
            </v-dialog>
          </v-col>
          <v-col cols="5">
            <v-dialog
              ref="startTimeDialog"
              v-model="modalStartTime"
              :return-value.sync="startTime"
              persistent
              width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="startTime"
                  label="Start Time"
                  prepend-icon="mdi-clock"
                  readonly
                  v-on="on"
                  disabled
                ></v-text-field>
              </template>
              <v-time-picker v-if="modalStartTime" v-model="startTime">
                <v-spacer></v-spacer>
                <v-btn text color="primary" @click="modalStartTime = false"
                  >Cancel</v-btn
                >
                <v-btn
                  text
                  color="primary"
                  @click="$refs.startTimeDialog.save(startTime)"
                  >OK</v-btn
                >
              </v-time-picker>
            </v-dialog>
          </v-col>
          <v-col cols="5">
            <!--
              END DATE ++ TIME
            -->
            <v-dialog
              ref="modalEndDateDialog"
              v-model="modalEndDate"
              :return-value.sync="endDate"
              persistent
              width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="endDate"
                  label="End Date"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-on="on"
                  :rules="endDateRules"
                  :error-messages="formErrors.endDate"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="endDate"
                scrollable
                :allowed-dates="allowedEnd"
              >
                <v-spacer></v-spacer>
                <v-btn text color="primary" @click="modalEndDate = false"
                  >Cancel</v-btn
                >
                <v-btn
                  text
                  color="primary"
                  @click="$refs.modalEndDateDialog.save(endDate)"
                  >OK</v-btn
                >
              </v-date-picker>
            </v-dialog>
          </v-col>
          <v-col cols="5">
            <v-dialog
              ref="dialog"
              v-model="modalEndTime"
              :return-value.sync="endTime"
              persistent
              width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="endTime"
                  label="End Time"
                  prepend-icon="mdi-clock"
                  readonly
                  v-on="on"
                  disabled
                ></v-text-field>
              </template>
              <v-time-picker v-if="modalEndTime" v-model="endTime" full-width>
                <v-spacer></v-spacer>
                <v-btn text color="primary" @click="modalEndTime = false"
                  >Cancel</v-btn
                >
                <v-btn text color="primary" @click="$refs.dialog.save(endTime)"
                  >OK</v-btn
                >
              </v-time-picker>
            </v-dialog>
          </v-col>

          <v-col cols="7">
            <!--
              NOTES
            -->
            <v-textarea
              v-model="notes"
              label="Notes"
              prepend-icon="mdi-note"
              rows="2"
              clearable
              class="mt-3"
            ></v-textarea>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn
        color="warning darken-1"
        text
        :disabled="!isChanged"
        @click="resetChanges"
        >RESET</v-btn
      >
      <v-spacer></v-spacer>
      <v-btn color="primary" text @click="$emit('close')">CANCEL</v-btn>
      <v-btn
        color="success"
        text
        v-text="id ? 'SAVE' : 'SUBMIT'"
        @click.native="modalAction('submit')"
        :disabled="!valid || Object.keys(formErrors).length > 0 || !isChanged"
      ></v-btn>
    </v-card-actions>
    <v-dialog
      v-model="modalPatronEdit"
      transition="dialog-transition"
      max-width="800"
    >
      <patronEdit
        :key="modalPatronEdit"
        @close="modalPatronEdit = false"
        @patronAdded="onPatronAdd"
      ></patronEdit>
    </v-dialog>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
import filters from '@/modules/filters'
import Vue2Filters from 'vue2-filters'
export default {
  name: 'eventEdit',
  components: {
    // ciListMenu: () => import('@/components/global/listTiles')
    patronEdit: () => import('@/components/patron/patronDetails')
  },
  props: [],
  mixins: [Vue2Filters.mixin],
  data() {
    return {
      ciSelected: null,
      endDate: null,
      endTime: null,
      id: null,
      modalPatronEdit: false,
      patronSelected: null,
      startDate: null,
      startTime: null,
      statusData: {
        blocked: {
          icon: 'mdi-phone-cancel',
          color: 'error'
        },
        disabled: {
          icon: 'mdi-phone-cancel',
          color: 'error'
        },
        enabled: {
          icon: 'mdi-check-circle',
          color: 'success'
        },
        unavailable: {
          icon: 'mdi-calendar-alert',
          color: 'warning'
        }
      },
      modalEndDate: false,
      modalEndTime: false,
      modalStartDate: false,
      modalStartTime: false,
      notes: '',
      originalValues: {
        ciSelected: null,
        endDate: null,
        endTime: null,
        patronSelected: null,
        startDate: null,
        startTime: null,
        notes: ''
      },
      endDateRules: [
        v =>
          new Date(v) >= new Date(this.startDate) ||
          'END DATE MUST BE AFTER START DATE'
      ],
      valid: true
    }
  },
  computed: {
    ...mapState({
      catalogItems: state => state.catalogItems,
      categories: state => state.categories,
      events: state => state.events,
      eventEditting: state => state.eventEditting,
      filter: state => state.filter,
      patrons: state => state.patrons
    }),
    endDateFormatted: {
      get() {
        if (!this.endDate) return null

        const [year, month, day] = this.endDate.split('-')
        return `${month}/${day}/${year}`
      },
      set(v) {
        this.endDate = v
      }
    },
    formErrors() {
      let errors = {}
      const requireds = [
        'patronSelected',
        'ciSelected',
        'startDate',
        'endDate',
        'patronSelected'
      ]
      requireds.forEach(key => {
        if (!this[key]) {
          errors[key] = ['Required']
        }
      })
      let end = new Date(this.endDate)
      let start = new Date(this.startDate)
      if (end < start) {
        errors.endDate = ['End date must come after start.']
      }
      if (this.ciSelectedStatus !== 'enabled' && !errors.ciSelected) {
        errors.ciSelected = ['Item invalid status']
      }

      return errors
    },
    isChanged() {
      //TODO: FIND WHY AFTER SAVING isChanged does not reset to false
      let isChanged = false
      Object.keys(this.originalValues).forEach(field => {
        if (this.originalValues[field] !== this[field]) {
          isChanged = true
        }
      })
      return isChanged
    },
    itemList() {
      let list = []
      for (let item of this.catalogItems) {
        let ci = { ...item }
        const category = filters.categoryById(ci.category, this.categories)
        // console.log(ci)
        // console.log(category)
        ci.isDisabled = false
        ci.category = category && category.name ? category.name : 'unk'
        ci.image =
          ci.image_data.src ||
          'https://www.eipl.org/reservations/images/uploads/458d8cab268259a7e676eadc42ec2c6d.gif'
        if (ci.status !== 'enabled') {
          ci.isDisabled = true
        } else if (this.startDate && this.endDate) {
          this.events.forEach(event => {
            if (
              event.item_id === item.id &&
              filters.testRangeOverlap(
                this.startDate,
                this.endDate,
                event.start_date,
                event.end_date
              )
            ) {
              ci.isDisabled = true
              ci.status = 'unavailable'
            }
          })

          // test available
        } else {
          ci.isDisabled = false
        }

        if (
          this.eventEditting &&
          this.eventEditting.ciData &&
          this.eventEditting.ciData.id === ci.id
        ) {
          ci.isDisabled = false
          ci.status = 'enabled'
        }
        list.push(ci)
      }
      return list
    },
    patronList() {
      //TODO: add fillters
      return this.patrons
    },
    ciSelectedStatus() {
      if (!this.ciSelected) {
        return null
      } else {
        const id = this.ciSelected.id
        const item = filters.customfieldById(id, this.itemList)

        return item.status
      }
    }
  },
  methods: {
    allowedStart(val) {
      let events = []
      if (this.ciSelected) {
        const ci = { ...this.ciSelected }
        events = this.events.filter(e => {
          if (e.item_id === ci.id) {
            return !filters.testRangeOverlap(e.start_date, e.end_date, val, val)
          } else {
            return true
          }
        })
        return events.length >= this.events.length
      } else {
        return true
      }
    },
    allowedEnd(val) {
      let cDate = new Date(val)
      let startDate = new Date(this.startDate)
      return cDate > startDate
    },
    customFilter(item, queryText) {
      const possibleKeys = [
        'abbreviation',
        'category',
        'name',
        'first_name',
        'last_name',
        'barcode'
      ]
      return filters.findStringMatchesInObj(item, possibleKeys, queryText)
    },
    dateMin() {
      const now = new Date()
      let month = now.getMonth() + 1
      let day = now.getDate()
      const year = now.getFullYear()
      if (day < 10) {
        day = '0' + day
      }
      if (month < 10) {
        month = '0' + month
      }
      //console.log(year + '-' + month + '-' + day)
      return year + '-' + month + '-' + day
    },
    modalAction(action) {
      let data = []
      data['action'] = action
      if (action === 'submit') {
        if (this.$refs.form.validate()) {
          data['startDate'] = this.startDate
          data['endDate'] = this.endDate
          data['nameFirst'] = this.nameFirst
          data['nameLast'] = this.nameLast
          data['barcode'] = this.barcode
          data['notes'] = this.notes
          data['device'] = this.device
        }
      }
      this.$emit('addEventModalAction', data)
    },
    onPatronAdd(e) {
      this.patronSelected = e
      this.modalPatronEdit = false
    },
    setEventValue(e) {
      this.ciSelected = filters.customfieldById(e.item_id, this.itemList)
    },
    resetChanges() {
      Object.keys(this.originalValues).forEach(field => {
        this[field] = this.originalValues[field]
      })
    }
  },
  mounted() {
    // console.log('mounted')
    if (this.eventEditting) {
      const event = this.eventEditting
      console.log('ci editting:', event)
      if (event.id) {
        this.id = event.id
      }
      if (event.ciData) {
        this.ciSelected = event.ciData
      }
      if (event.patronData) {
        this.patronSelected = event.patronData
      }
      if (event.start_date) {
        const splitStart = event.start_date.split(' ')
        console.log(splitStart)
        this.startDate = splitStart[0]
        this.startTime = splitStart[1] || null
      }
      if (event.end_date) {
        const splitEnd = event.end_date.split(' ')
        console.log(splitEnd)
        this.endDate = splitEnd[0]
        this.endTime = splitEnd[1] || null
      }
      const values = [
        'ciSelected',
        'patronSelected',
        'startDate',
        'endDate',
        'startTime',
        'endTime',
        'notes'
      ]
      values.forEach(v => this.$set(this.originalValues, v, this[v]))
    }
  }
}
</script>

<style scoped></style>