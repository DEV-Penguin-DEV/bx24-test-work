<template>
  <v-table fixed-header>
    <thead>
      <tr>
        <th class="text-center">Название стадии</th>
        <th class="text-center">Кол-во сделок, находящихся на стадии</th>
        <th class="text-center">
          Кол-во сделок, перешедших в стадию за период
          <v-container>
            <v-row>
              <v-col class="data-picker__container">
                <!-- Ваша кнопка или элемент для открытия/сворачивания v-date-picker -->
                <v-btn @click="toggleDatePicker">Toggle Date Picker</v-btn>
                <!-- Используйте модификатор menu-props для сворачивания -->
                <v-date-picker
                  class="data-picker"
                  v-model="selectedDate"
                  :format="'YYYY-MM-DDTHH:mm:ssZZ'"
                  :v-if="menuProps"
                  :multiple="true"
                  :style="`display: ${menuProps ? 'block' : 'none'}`"
                  @click:cancel="toggleDatePicker"
                  @update:model-value="changeDate"
                ></v-date-picker>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <!-- Отображение выбранной даты -->
                <p v-if="selectedDate">
                  Выбранная дата c {{ selectedDate[0] }} по
                  {{ selectedDate[1] ? selectedDate[1] : selectedDate[0] }}
                </p>
              </v-col>
            </v-row>
          </v-container>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in stagesWithStatistics" :key="item.NAME">
        <td class="text-center">{{ item.NAME }}</td>
        <td class="text-center">{{ item.count }}</td>
        <td class="text-center">
          {{
            stagesWithDateStatistics[index]
              ? stagesWithDateStatistics[index].count
              : 0
          }}
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<style lang="scss">
.data-picker {
  position: absolute;
}

.data-picker__container {
  position: relative;
}

.data-picker {
  position: absolute;
}

.v-table__wrapper {
  overflow: visible !important;
}
</style>

<script>
import BX24API from "../bx24";
import { VDatePicker } from "vuetify/labs/VDatePicker";
import dayjs from "dayjs";

export default {
  data() {
    return {
      stages: [],
      stagesWithStatistics: [],
      stagesWithDateStatistics: [],
      selectedDate: null,
      menuProps: false,
    };
  },
  async mounted() {
    this.stages = await BX24API.callMethod(
      "crm.dealcategory.stage.list",
      { id: 0 },
      function (result) {
        if (result.error()) console.error(result.error());
        else console.dir(result.data());
      }
    );
    this.stages = this.stages.result;

    this.stagesWithStatistics = await getStagesWithStatistics(this.stages);

    this.stagesWithDateStatistics = this.stagesWithStatistics;
    console.log(this.stagesWithDateStatistics);
  },
  methods: {
    toggleDatePicker() {
      this.menuProps = !this.menuProps;
    },
    async changeDate() {
      this.stagesWithDateStatistics = await getStagesWithStatistics(
        this.stages,
        this.selectedDate,
        true
      );

      this.toggleDatePicker();
    },
  },
  components: { VDatePicker },
};

async function getStagesWithStatistics(
  stages,
  selectedDate = null,
  withDate = false
) {
  const sales = await getSales(
    withDate && selectedDate
      ? [
          dayjs(selectedDate[0]).format("YYYY-MM-DDTHH:mm:ssZZ"),
          selectedDate[1]
            ? dayjs(selectedDate[1]).format("YYYY-MM-DDTHH:mm:ssZZ")
            : dayjs(selectedDate[0]).format("YYYY-MM-DDTHH:mm:ssZZ"),
        ]
      : null
  );

  // Создайте объект для хранения статистики
  const statistics = {};

  // Пройдитесь по массиву объектов
  sales.forEach((sale) => {
    const stageId = sale.STAGE_ID;

    // Проверьте, есть ли такой тип в статистике, и если нет, создайте его
    if (!statistics[stageId]) {
      statistics[stageId] = 0;
    }

    // Увеличьте счетчик для данного типа
    statistics[stageId]++;
  });

  return Object.keys(statistics)
    .filter((type) => stages.some((stage) => stage.STATUS_ID === type))
    .reduce((obj, type) => {
      const stage = stages.find((item) => item.STATUS_ID === type);
      if (stage) {
        obj[type] = {
          count: statistics[type],
          NAME: stage.NAME,
        };
      }
      return obj;
    }, {});
}

async function getSales(filters = null) {
  const sales = await BX24API.callMethod(
    "crm.deal.list",
    {
      order: { STAGE_ID: "ASC" },

      select: ["ID", "TITLE", "STAGE_ID", "BEGINDATE"],
    },
    (result) => {
      if (result.error()) console.error(result.error());
      else {
        console.dir(result.data());
        if (result.more()) result.next();
      }
    }
  );
  if (filters) {
    return sales.result.filter((item) => {
      const startDate = new Date(filters[0]); // Пример начальной даты
      const endDate = filters.length >= 2 ? new Date(filters[1]) : null;

      const itemDate = new Date(item.BEGINDATE);

      // Верните true, если BEGINDATE объекта находится в промежутке между startDate и endDate
      return endDate
        ? itemDate >= startDate && itemDate <= endDate
        : itemDate >= startDate;
    });
  }
  return sales.result;
}
</script>

<style lang="scss" scoped></style>
