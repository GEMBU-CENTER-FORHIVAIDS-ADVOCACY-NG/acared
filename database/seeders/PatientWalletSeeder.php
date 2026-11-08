<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Updates patients.wallet from app_wallets.wallet_balance (non-zero only).
 * Match key: app_wallets.wallet_id  ->  patients.slug
 *
 * Run: php artisan db:seed --class=PatientWalletSeeder
 */
class PatientWalletSeeder extends Seeder
{
    public function run(): void
    {
        // [slug (wallet_id), fullname (for reporting only), p_group, wallet_balance]
        $wallets = [
            ['10004', 'Refund Transaction', '', '-16414234.74'],
            ['PSN0000125', 'Jitar Godswill', 'EMP', '-2975.00'],
            ['PSN0000113', 'John Odia', 'PAT', '-1000.00'],
            ['40002', 'Life Action Plus', 'PAT', '-249868.80'],
            ['1036437', 'VENUS MEDICAL LIMITED', 'PAT', '-626973.35'],
            ['50012', 'Audrey Sickle Cel Foundation', 'PAT', '1100.00'],
            ['29043', 'Sewong Peter', 'PAT', '-15000.00'],
            ['6981', 'Nannyuy Justina Justine', 'EMPR', '-362610.00'],
            ['20223', 'Wilson Kwanho Nyambant', 'EMP', '-16000.00'],
            ['1470', 'Justine Appolonia', 'EMPR', '-8180.00'],
            ['PSN0000151', 'Sankun Grace', 'EMP', '-52220.00'],
            ['2832', 'Lavuah Florence', 'PAT', '-15000.00'],
            ['PSN0000156', 'Njoka Louis', 'EMP', '-18525.00'],
            ['PSN0000225', 'Tatah   Innocent Kiloh', 'EMP', '-89110.00'],
            ['36736', 'BABA HALIMA', 'ART', '-135.00'],
            ['80444', 'Augustine Rosemary', 'PAT', '-75785.00'],
            ['80477', 'Saidu Modi', 'PAT', '-40900.00'],
            ['1873', 'Mairiyama Abdulahi', 'ART', '-1000.00'],
            ['80617', 'AXAMANSARD CUSO   INTERNATIONAL', 'PAT', '-26016.46'],
            ['80649', 'Hassan Bello', 'PAT', '-0.02'],
            ['60794', 'Ladi Jika', 'PAT', '-43280.00'],
            ['19237', 'Ahijo Fadimatu', 'ART', '-39625.00'],
            ['40824', 'Godgive Getap', '', '-27485.00'],
            ['81368', 'Abdullahi Saidu', 'PAT', '-42600.00'],
            ['81403', 'Ali Hamanjidda', 'PAT', '-43410.00'],
            ['PSN0000202', 'Mbali Exodus', 'EMP', '-4200.00'],
            ['82328', 'Kingsley Chinaza', 'PAT', '-28530.00'],
            ['82453', 'Alice Jonathan', 'PAT', '-0.02'],
            ['82488', 'Hassan Usman', 'PAT', '-0.02'],
            ['PSN0000159', 'Alpha    Elias Nchandom', 'EMP', '-55185.00'],
            ['PSN000017', 'Philimon Kumuh', 'EMP', '0.18'],
            ['50990', 'Ekeanyanwu Promise Obinna', 'EMP', '-73415.00'],
            ['PSN0000120', 'Galatians Merica', 'PAT', '-17037.50'],
            ['PSN0000168', 'Venson U Benjamin', 'EMP', '-38245.00'],
            ['PSN0000170', 'Justine Boniface', 'EMP', '-61212.50'],
            ['1694', 'Mercy Tuh', 'EMP', '-2195.00'],
            ['33044', 'Jami A Hendrick', 'EMP', '-33880.00'],
            ['80534', 'ELKANA ATEYO', 'EMP', '0.50'],
            ['PSN0000176', 'Felix Emmanuel', 'EMP', '-7607.50'],
            ['PSN0000252', 'Blessing Godlove', 'EMP', '-24662.50'],
            ['PSN000056', 'Gemnjoh Cyprian', 'EMP', '-13760.00'],
            ['35959', 'Lusuly Luta', 'PAT', '-6155.00'],
            ['82941', 'Mercy Fund', 'PAT', '-4690.00'],
            ['PSN0000131', 'Yuktap Melody', 'EMP', '-65098.58'],
            ['PSN0000167', 'Philimon Kumuh', 'EMP', '-69095.00'],
            ['83242', 'Barvuah Hope', 'PAT', '-14000.00'],
            ['83261', 'William Sunday', 'EMP', '-3900.00'],
            ['84344', 'Husseini Halima', 'PAT', '-6000.00'],
            ['84355', 'Sule Mohammed', 'PAT', '-16550.00'],
            ['84412', 'Isa Hammanjoda', 'PAT', '-35535.00'],
            ['84934', 'Out Reach', 'PAT', '10000.00'],
            ['85025', 'Auwalu Abubakar', 'PAT', '-36820.00'],
            ['85382', 'Jerry Andrew', 'PAT', '-28945.00'],
            ['85423', 'BASTION INTERNATIONAL HMO', 'PAT', '-99832.96'],
            ['85598', 'SONGHAI NHIA', 'PAT', '20809.00'],
            ['85701', 'FAMILY HEALTH INTERNATIONAL F.H.I 360', 'PAT', '-40360.00'],
            ['85722', 'Mohammad Zainab', 'PAT', '-14730.00'],
            ['85947', 'Idris Ahmed Mohammed', 'PAT', '-12600.00'],
            ['86002', 'Gideon Eveline', 'PAT', '-45030.00'],
            ['86018', 'Saidu Mamudu', 'PAT', '-45230.00'],
            ['86050', 'Abenigo Godwill', 'PAT', '-24405.00'],
            ['86068', 'Jalo Sajo', 'PAT', '-41420.00'],
            ['86605', 'Muhammadu A. Tamu', 'PAT', '-32665.00'],
            ['86803', 'Sadiya Saidu', 'PAT', '-48055.00'],
            ['86961', 'Emile Eliora', 'PAT', '-1000.00'],
            ['87216', 'Aisha Aliyu', 'PAT', '-80000.00'],
            ['87233', 'Kennedy Lawrence', 'PAT', '-2000.00'],
            ['87257', 'Augustine Alice', 'PAT', '-230590.00'],
            ['87303', 'Tiwu Princewill', 'PAT', '-17060.00'],
            ['87329', 'Lot Naphtali', 'EMP', '-123640.00'],
            ['87342', 'Wilfred Mercy', 'PAT', '-100000.00'],
            ['87365', 'Hassan Asmau', 'PAT', '-100.00'],
            ['87406', 'Ahmadu Zuweratu', 'PAT', '-12505.00'],
            ['87512', 'Christopher Timothy', 'EMP', '-38416.50'],
            ['87697', 'Fehmi Muhammadu', 'PAT', '-40000.00'],
            ['87738', 'Abdulkarimu Umaru', 'PAT', '-8745.00'],
            ['87751', 'Jika Mairama', 'PAT', '-2870.00'],
            ['87802', 'Ali Zubainatu', 'PAT', '-53100.00'],
            ['87822', 'Lelwu Ezekiel', 'PAT', '-3705.00'],
            ['87866', 'Muniratu Umaru', 'PAT', '-1000.00'],
            ['87949', 'Gideon Miracle', 'PAT', '-28990.00'],
            ['87960', 'Muhammadu Yusufa', 'PAT', '-4760.00'],
            ['87989', 'Fourmi Erve', 'PAT', '-11095.00'],
            ['88122', 'Ayuba Ragaiyatu', 'PAT', '-8000.00'],
            ['88166', 'Zainab Yusuf', 'PAT', '-50065.00'],
            ['88245', 'Muhammadu Hajara', 'PAT', '-3020.00'],
            ['88261', 'Japhet Glory', 'PAT', '-12500.00'],
            ['28927', 'Adamu Iliyasu', 'PAT', '-44340.00'],
            ['88278', 'Timothy Beatrice', 'PAT', '-13830.00'],
            ['88363', 'Ishaku Safiu', 'PAT', '-72960.00'],
            ['88387', 'Saidu Ladifatu', 'PAT', '-7225.00'],
            ['88455', 'Sani Firdausi', 'PAT', '-4060.00'],
            ['88547', 'Sani Alihu', 'PAT', '-179540.00'],
            ['88552', 'Collins Chigekwu', 'PAT', '-71640.00'],
            ['88553', 'Abubakar Sadiq Ahmed', 'PAT', '-41820.00'],
            ['88579', 'Habiba Ismaila', 'PAT', '-3000.00'],
            ['88581', 'Abdu Muzainatu', 'PAT', '-17390.00'],
            ['88584', 'Hamidu Fadimatu', 'PAT', '-8430.00'],
            ['88685', 'Abana Mariyam', 'PAT', '-49755.00'],
            ['88698', 'Mamma Salihu', 'PAT', '-7885.00'],
            ['88761', 'Nurudeen Abubakar', 'PAT', '-12970.00'],
            ['88776', 'Aliyu Zubainatu', 'PAT', '-3560.00'],
            ['88780', 'Baba Abbu Aisha', 'PAT', '-39335.00'],
            ['88814', 'Moses Linda', 'PAT', '-3280.00'],
            ['88888', 'Yanbi Jonathan Wanmi', 'PAT', '-2200.00'],
            ['88896', 'Salisu Ndzi', 'PAT', '-11950.00'],
            ['88941', 'Nora Bilkisu', 'PAT', '-2000.00'],
            ['89036', 'Livinus Eric', 'PAT', '-27100.00'],
            ['89132', 'Axamansard GECHAAN Staff', 'PAT', '-226675.50'],
            ['89373', 'Lukman Saidu', 'PAT', '-50075.00'],
            ['89419', 'GECHAAN STAFF MEDICAL', 'PAT', '-54277.50'],
            ['89428', 'Ishaga Umar', 'PAT', '-166835.00'],
            ['89477', 'Zubairu Zerzeng', 'PAT', '-148180.00'],
            ['89495', 'Abdulmumini Jamila', 'PAT', '-262245.00'],
            ['89526', 'Hassan Adamu', 'PAT', '-91515.00'],
            ['89546', 'Aliyu Ahmadu', 'PAT', '-20000.00'],
            ['89550', 'Marvelous Gideon', 'PAT', '-17010.00'],
            ['89561', 'sale Mariyam', 'PAT', '-138980.00'],
            ['89567', 'Muhammad Hurerra', 'PAT', '-62110.00'],
            ['89568', 'JITABU THERESA', 'PAT', '-76040.00'],
            ['89579', 'Ali Ahmadu', 'PAT', '-80100.00'],
            ['89585', 'Ateyo Ter-Ivim', 'PAT', '-1630.00'],
            ['89586', 'Ilu Moshago', 'PAT', '-103940.00'],
            ['89588', 'Kamisu Hamidu', 'PAT', '-36000.00'],
        ];

        $updated = 0;
        $unmatched = [];

        DB::transaction(function () use ($wallets, &$updated, &$unmatched) {
            foreach ($wallets as [$slug, $name, $group, $balance]) {
                // DB::table() ignores soft deletes, so soft-deleted patients are updated too.
                $affected = DB::table('patients')
                    ->where('slug', $slug)
                    ->update(['wallet' => $balance]);

                if ($affected === 0) {
                    // 0 can also mean "already had this value", so double-check existence.
                    if (! DB::table('patients')->where('slug', $slug)->exists()) {
                        $unmatched[] = "{$slug} | {$name} | {$group} | {$balance}";

                        continue;
                    }
                }
                $updated++;
            }
        });

        $this->command?->info("Wallets processed: {$updated} of ".count($wallets));

        if ($unmatched) {
            $this->command?->warn('No patient found for '.count($unmatched).' slug(s) - see laravel.log');
            Log::warning('PatientWalletSeeder unmatched slugs', $unmatched);
        }
    }
}
