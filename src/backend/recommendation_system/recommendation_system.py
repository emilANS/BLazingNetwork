import psycopg

import math

# PostgreSQL database connection specifications
# Change password when project finished
conn = psycopg.connect(
    host="localhost",
    dbname="blazingDatabase",
    user="postgres",
    password="emilelbolo2024",
    port=5432,
)

cur = conn.cursor()

cur.execute("SELECT user_likes FROM user_information ORDER BY username ASC")

likes_list_no_processed = []

for liked_community in cur.fetchall():

    likes_list_no_processed.append(liked_community[0])

quantity_of_rows = 50

likes_list_with_empty_lists = []

for i in range(len(likes_list_no_processed)):

    likes_list_with_empty_lists.append([])

    if (
        likes_list_no_processed[i] is not None
        and len(likes_list_no_processed[i]) <= quantity_of_rows
    ):

        for i2 in range(len(likes_list_no_processed[i])):

            if i2 < quantity_of_rows:

                likes_list_with_empty_lists[i].append(likes_list_no_processed[i][i2])

    elif likes_list_no_processed[i] is None:

        likes_list_with_empty_lists[i].append([0])

likes_list_for_compare = [
    likes_list for likes_list in likes_list_with_empty_lists if likes_list != []
]

list_with_all_liked_communities = []

for i in range(len(likes_list_for_compare)):

    for i2 in range(len(likes_list_for_compare[i])):

        list_with_all_liked_communities.append(likes_list_for_compare[i][i2])

for i in range(len(list_with_all_liked_communities)):

    for i2 in range(len(list_with_all_liked_communities)):

        try:

            if (
                list_with_all_liked_communities[i]
                == list_with_all_liked_communities[i2]
                and i != i2
            ):

                list_with_all_liked_communities.pop(i2)

        except IndexError:

            pass

likes_list = []

for i in range(len(likes_list_for_compare)):

    likes_list.append([])

    for i2 in range(len(list_with_all_liked_communities)):

        likes_list[i].append(0)

        for i3 in range(len(likes_list_for_compare[i])):

            if list_with_all_liked_communities[i2] == likes_list_for_compare[i][i3]:

                for i4 in range(len(list_with_all_liked_communities)):

                    if (
                        likes_list_for_compare[i][i3]
                        == list_with_all_liked_communities[i4]
                    ):

                        likes_list[i][i4] = 1

print("HERE BOLO: ", likes_list)

index_to_be_compared = 0

quantity_of_rows = 4

multiplication = []

for i in range(len(likes_list)):

    multiplication.append([])

    for i2 in range(len(likes_list)):

        multiplication[i].append([])

        for i3 in range(len(likes_list[i2])):

            multiplication[i][i2].append(likes_list[i][i3] * likes_list[i2][i3])

result_of_sums = []

for i in range(len(multiplication)):

    result_of_sums.append([])

    for i2 in range(len(multiplication[i])):

        sum = 0

        for i3 in range(len(multiplication[i][i2])):

            sum += multiplication[i][i2][i3]

        result_of_sums[i].append(sum)

square_root_sum = []

for i in range(len(likes_list)):

    square_root_sum.append([])

    for i2 in range(len(likes_list[i])):

        square_root_sum[i].append(likes_list[i][i2] * likes_list[i][i2])

for i in range(len(square_root_sum)):

    sum = 0

    for i2 in range(len(square_root_sum[i])):

        sum += square_root_sum[i][i2]

    square_root_sum[i] = math.sqrt(sum)

norm_product = []

for i in range(len(square_root_sum)):

    norm_product.append([])

    for i2 in range(len(square_root_sum)):

        norm_product[i].append(square_root_sum[i] * square_root_sum[i2])

results_cosine = []

for i in range(len(norm_product)):

    results_cosine.append([])

    for i2 in range(len(norm_product[i])):

        results_cosine[i].append(result_of_sums[i][i2] / norm_product[i][i2])

print("Results of cosine: ", results_cosine)

results_file = open("results_of_recommendation_system.txt", "w")

results_file.write(str(results_cosine))

results_file.close()
