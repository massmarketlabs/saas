<i18n src="./i18n.json"></i18n>

<script setup lang="ts">
import ICountUp from 'vue-countup-v3'

definePageMeta({
  layout: false
})

const { t } = useI18n()

const { data } = await useFetch('/api/admin/reports')

const stats = ref([
  {
    name: 'activeUsers',
    value: data.value?.user.total,
    change: data.value?.user.percentageChange,
    isIncrease: data.value?.user.trend === 'increase',
    lastYear: data.value?.user.lastYear,
    currentYear: data.value?.user.currentYear,
    icon: 'users'
  },
  {
    name: 'activePrograms',
    value: data.value?.program.total,
    change: data.value?.program.percentageChange,
    isIncrease: data.value?.program.trend === 'increase',
    lastYear: data.value?.program.lastYear,
    currentYear: data.value?.program.currentYear,
    icon: 'folder'
  },
  {
    name: 'totalInterventions',
    value: data.value?.intervention.total,
    change: data.value?.intervention.percentageChange,
    isIncrease: data.value?.intervention.trend === 'increase',
    lastYear: data.value?.intervention.lastYear,
    currentYear: data.value?.intervention.currentYear,
    icon: 'school'
  },
  {
    name: 'customerSatisfaction',
    value: 94.8,
    decimalPlaces: 1,
    suffix: '%',
    change: '+2.3',
    isIncrease: true,
    icon: 'smile'
  }
])

// const RevenueData = [
//   { month: 'January', desktop: 186, mobile: 80 },
//   { month: 'February', desktop: 305, mobile: 200 },
//   { month: 'March', desktop: 237, mobile: 120 },
//   { month: 'April', desktop: 73, mobile: 190 },
//   { month: 'May', desktop: 209, mobile: 130 },
//   { month: 'June', desktop: 214, mobile: 140 }
// ]
// const RevenueCategoriesMultple = {
//   desktop: { name: 'Desktop', color: '#029752' },
//   mobile: { name: 'Mobile', color: '#4ade80' }
// }

// const categories: Record<string, BulletLegendItemInterface> = {
//   desktop: { name: 'Desktop', color: '#029752' },
//   mobile: { name: 'Mobile', color: '#4ade80' }
// }

// const AreaChartData = [
//   { date: '2024-04-01', desktop: 222, mobile: 150 },
//   { date: '2024-04-02', desktop: 180, mobile: 97 },
//   { date: '2024-04-03', desktop: 167, mobile: 120 },
//   { date: '2024-04-04', desktop: 260, mobile: 240 },
//   { date: '2024-04-05', desktop: 240, mobile: 290 }
// ]

// const xFormatter = (i: number): string | number => AreaChartData[i]?.date || ''
</script>

<template>
  <NuxtLayout name="admin">
    <div class="space-y-8">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UCard
          v-for="stat in stats"
          :key="stat.name"
          class="relative overflow-hidden"
        >
          <UTooltip
            :disabled="!stat.lastYear || !stat.currentYear"
            class="h-full"
            :ui="{ content: 'h-full' }"
          >
            <template #content>
              <div class="space-y-3">
                <p>
                  <strong>Last Year</strong>
                  {{ stat.lastYear }}
                </p>
                <p>
                  <strong>Current Year</strong>
                  {{ stat.currentYear }}
                </p>
                <p>
                  <strong>Total</strong>
                  {{ stat.value }}
                </p>
              </div>
            </template>
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ t(`dashboard.stats.${stat.name}`) }}
                </div>
                <ICountUp
                  class="mt-1 text-2xl font-semibold"
                  :end-val="stat.value || '0'"
                  :decimal-places="stat.decimalPlaces"
                >
                  <template #suffix>
                    {{ stat.suffix }}
                  </template>
                </ICountUp>
                <div
                  class="mt-2 flex items-center text-sm"
                  :class="stat.isIncrease ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                >
                  <Icon
                    :name="stat.isIncrease ? 'lucide:trending-up' : 'lucide:trending-down'"
                    class="mr-1 h-4 w-4"
                  />
                  {{ stat.change }}%
                </div>
              </div>
              <Icon
                :name="`lucide:${stat.icon}`"
                class="h-8 w-8 text-gray-400 dark:text-gray-600"
              />
            </div>
          </UTooltip>
        </UCard>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <!-- <UCard>

          <AreaChart
            :data="AreaChartData"
            :height="250"
            :categories="categories"
            :y-num-ticks="4"
            :x-num-ticks="7"
            :grid-line-y="true"
            legend-poisition="top"
            :x-formatter="xFormatter"
          />
        </UCard> -->
        <!-- <UCard>
          <BarChart
            :data="RevenueData"
            :stacked="true"
            :height="250"
            :categories="RevenueCategoriesMultple"
            :y-axis="['desktop', 'mobile']"
            :group-padding="0"
            :bar-padding="0.2"
            :x-num-ticks="6"
            :radius="4"
            :orientation="Orientation.Horizontal"
            :x-formatter="(i) => i"
            :y-formatter="(i: number): string => `${RevenueData[i]!.month}`"
            :legend-position="LegendPosition.Top"
          />
        </UCard> -->
      </div>
    </div>
  </NuxtLayout>
</template>
